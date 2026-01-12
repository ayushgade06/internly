let duplicateConfirmed = false;
let showingSaved = false;
let editingAppId = null;

const newView = document.getElementById("newView");
const savedView = document.getElementById("savedView");
const toggleBtn = document.getElementById("toggleViewBtn");
const form = document.getElementById("applicationForm");
const saveBtn = form.querySelector('button[type="submit"]');

const statusSelect = document.getElementById("status");
const statusWrapper = document.getElementById("statusWrapper");

let latestApplicationFromPage = null;

const DEFAULT_API_BASE = "http://localhost:3000"; 
let currentApiBase = DEFAULT_API_BASE;

/**
 * Check if the user is currently on an Internly site (localhost or LAN IP)
 * and update the API_BASE URL accordingly.
 */
async function getEffectiveApiBase() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      const url = new URL(tab.url);
      if (url.port === "3000" || url.hostname === "localhost" || url.hostname.startsWith("192.168")) {
        const detected = `${url.protocol}//${url.host}`;
        await chrome.storage.local.set({ apiBase: detected });
        return detected;
      }
    }
  } catch (e) {

  }
  const stored = await chrome.storage.local.get("apiBase");
  return stored.apiBase || DEFAULT_API_BASE;
}

// -------------------------------
// 🔐 AUTH TOKEN
// -------------------------------
async function ensureAuthToken() {
  currentApiBase = await getEffectiveApiBase();


  const authWarning = document.getElementById("authWarning");
  const loginLink = document.getElementById("loginLink");

  loginLink.onclick = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: currentApiBase });
  };

  const stored = await chrome.storage.local.get("authToken");
  
  // Try to verify existing token or get new one
  try {
    const res = await fetch(
      `${currentApiBase}/api/internly/session-token`,
      { credentials: "include" }
    );

    if (!res.ok) {
      await chrome.storage.local.remove("authToken");
      authWarning.style.display = "block";
      return null;
    }

    const data = await res.json();
    if (!data.token) {
      await chrome.storage.local.remove("authToken");
      authWarning.style.display = "block";
      return null;
    }

    authWarning.style.display = "none";
    await chrome.storage.local.set({ authToken: data.token });
    return data.token;
  } catch (err) {

    // If we have an edge-case network error, keep existing token but show warning
    authWarning.style.display = stored.authToken ? "none" : "block";
    return stored.authToken || null;
  }
}

// Notify the background script to start syncing

function triggerBackgroundSync() {
  chrome.runtime.sendMessage({ type: "SYNC_APPLICATIONS" });
}

// -------------------------------
function getStatusClass(status) {
  return `status-${(status || "saved").toLowerCase()}`;
}

// -------------------------------
toggleBtn.addEventListener("click", () => {
  showingSaved = !showingSaved;

  if (showingSaved) {
    newView.hidden = true;
    savedView.hidden = false;
    toggleBtn.textContent = "Back to New Application";
    loadSavedApplications();
  } else {
    exitEditMode();
  }
});

// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  statusWrapper.hidden = true;



  // Perform auth check asynchronously

  ensureAuthToken().then(token => {
    if (token) {

      triggerBackgroundSync();
    }
  });

  chrome.runtime.sendMessage(
    { type: "GET_LATEST_APPLICATION" },
    (response) => {

      const app = response?.application;
      latestApplicationFromPage = app || null;

      if (!app && !editingAppId) {

        form.hidden = true;
        document.getElementById("emptyState").hidden = false;
        return;
      }


      form.hidden = false;
      document.getElementById("emptyState").hidden = true;

      if (!app) return;

      document.getElementById("confidence").textContent =
        "Confidence: " + app.confidence;

      company.value = app.company || "";
      role.value = app.role || "";
      stipend.value = app.stipend || "";
      description.value = app.description || "";
    }
  );
});

// -------------------------------
function updateApplicationStatus(applicationId) {
  chrome.storage.local.get(["applications"], (res) => {
    const apps = (res.applications || []).map((a) =>
      a.applicationId === applicationId
        ? {
            ...a,
            status: "Applied",
            updatedAt: new Date().toISOString(),
            source: "extension",
          }
        : a
    );

    chrome.storage.local.set({ applications: apps }, () => {
      triggerBackgroundSync();
      loadSavedApplications();
    });
  });
}

// -------------------------------
function deleteApplication(applicationId) {
  if (!confirm("Delete this application?")) return;

  chrome.storage.local.get(["applications"], (res) => {
    const apps = (res.applications || []).filter(
      (a) => a.applicationId !== applicationId
    );

    chrome.storage.local.set({ applications: apps }, () => {
      triggerBackgroundSync();
      loadSavedApplications();
    });
  });
}

// -------------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const warningEl = document.getElementById("warning");

  let applicationId =
    editingAppId ||
    latestApplicationFromPage?.applicationId ||
    `manual://${Date.now()}`;

  chrome.storage.local.get(["applications"], (res) => {
    let apps = res.applications || [];
    const existing = apps.find((a) => a.applicationId === applicationId);

    const entry = {
      applicationId,
      applicationUrl:
        latestApplicationFromPage?.applicationUrl || applicationId,
      company: company.value.trim(),
      role: role.value.trim(),
      stipend: stipend.value,
      description: description.value,
      savedAt: existing?.savedAt || new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "extension",
      status: editingAppId
        ? statusSelect.value
        : existing?.status || "Saved",
    };

    if (editingAppId) {
      apps = apps.map((a) =>
        a.applicationId === editingAppId ? entry : a
      );

      chrome.storage.local.set({ applications: apps }, () => {
        triggerBackgroundSync();
        exitEditMode();
        showingSaved = true;
        newView.hidden = true;
        savedView.hidden = false;
        toggleBtn.textContent = "Back to New Application";
        loadSavedApplications();
      });
      return;
    }

    if (existing && !duplicateConfirmed) {
      warningEl.textContent =
        "This exact role from this page is already saved. Click Save again to update it.";
      warningEl.style.display = "block";
      duplicateConfirmed = true;
      return;
    }

    if (existing) {
      apps = apps.map((a) =>
        a.applicationId === applicationId ? entry : a
      );
    } else {
      apps.push(entry);
    }

    chrome.storage.local.set({ applications: apps }, () => {
      triggerBackgroundSync();
      chrome.runtime.sendMessage({ type: "CLEAR_LATEST_APPLICATION" });
      setTimeout(() => window.close(), 300);
    });
  });
});

// -------------------------------
function loadSavedApplications() {
  const list = document.getElementById("savedList");
  list.innerHTML = "";

  chrome.storage.local.get(["applications"], (res) => {
    const apps = res.applications || [];

    if (apps.length === 0) {
      list.innerHTML = "<li>No saved applications yet.</li>";
      return;
    }

    apps.forEach((app) => {
      const li = document.createElement("li");
      li.className = "saved-item";

      li.innerHTML = `
        <strong>${app.company}</strong><br/>
        <span>${app.role}</span><br/>
        <span class="status-badge ${getStatusClass(app.status)}">
          ${app.status || "Saved"}
        </span><br/>
        <span>Saved: ${new Date(app.savedAt).toLocaleDateString()}</span>
        <div class="actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          ${
            app.status !== "Applied"
              ? `<button class="mark-applied-btn">Mark as Applied</button>`
              : ""
          }
        </div>
      `;

      li.querySelector(".edit-btn").onclick = () => enterEditMode(app);
      li.querySelector(".delete-btn").onclick = () =>
        deleteApplication(app.applicationId);
      li.querySelector(".mark-applied-btn")?.addEventListener("click", () =>
        updateApplicationStatus(app.applicationId)
      );

      list.appendChild(li);
    });
  });
}

// -------------------------------
function enterEditMode(app) {
  editingAppId = app.applicationId;
  duplicateConfirmed = true;

  form.hidden = false;
  document.getElementById("emptyState").hidden = true;

  company.value = app.company || "";
  role.value = app.role || "";
  stipend.value = app.stipend || "";
  description.value = app.description || "";

  statusWrapper.hidden = false;
  statusSelect.value = app.status || "Saved";

  saveBtn.textContent = "Update";

  newView.hidden = false;
  savedView.hidden = true;
  toggleBtn.textContent = "Back to Saved Applications";
}

function exitEditMode() {
  editingAppId = null;
  duplicateConfirmed = false;

  form.reset();
  statusWrapper.hidden = true;

  saveBtn.textContent = "Save";

  newView.hidden = false;
  savedView.hidden = true;
  toggleBtn.textContent = "View Saved Applications";
}
