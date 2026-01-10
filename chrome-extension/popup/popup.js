let duplicateConfirmed = false;
let showingSaved = false;
let editingAppId = null; // 🔑 applicationUrl-based identity

const newView = document.getElementById("newView");
const savedView = document.getElementById("savedView");
const toggleBtn = document.getElementById("toggleViewBtn");
const form = document.getElementById("applicationForm");
const saveBtn = form.querySelector('button[type="submit"]');

const statusSelect = document.getElementById("status");
const statusWrapper = document.getElementById("statusWrapper");

let latestApplicationFromPage = null;

// -------------------------------
// Status badge helper (UI ONLY)
// -------------------------------
function getStatusClass(status) {
  return `status-${(status || "saved").toLowerCase()}`;
}

// -------------------------------
// Toggle View
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
// Load latest detected application
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  statusWrapper.hidden = true;

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
// Update status helper
// -------------------------------
function updateApplicationStatus(appUrl) {
  chrome.storage.local.get(["applications"], (res) => {
    const apps = (res.applications || []).map((a) =>
      a.applicationUrl === appUrl
        ? {
            ...a,
            status: "Applied",
            submittedAt: new Date().toISOString(),
            updatedAt: Date.now(),
            source: "extension",
          }
        : a
    );

    chrome.storage.local.set({ applications: apps }, loadSavedApplications);
  });
}

// -------------------------------
// Delete helper
// -------------------------------
function deleteApplication(appUrl) {
  if (!confirm("Delete this application?")) return;

  chrome.storage.local.get(["applications"], (res) => {
    const apps = (res.applications || []).filter(
      (a) => a.applicationUrl !== appUrl
    );

    chrome.storage.local.set({ applications: apps }, loadSavedApplications);
  });
}

// -------------------------------
// Save / Update Handler
// -------------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const warningEl = document.getElementById("warning");

  let applicationId = editingAppId
    ? editingAppId
    : latestApplicationFromPage?.applicationUrl;

  if (!applicationId) {
    applicationId = `manual://${Date.now()}`;
  }

  chrome.storage.local.get(["applications"], (res) => {
    let apps = (res.applications || []).map((a) => ({
      ...a,
      id: a.id || a.applicationUrl,
      status: a.status || "Saved",
      createdAt: a.createdAt || Date.now(),
      updatedAt: a.updatedAt || Date.now(),
      source: a.source || "extension",
    }));

    const existing = apps.find((a) => a.id === applicationId);

    const entry = {
      id: applicationId,
      applicationUrl: applicationId,
      company: company.value.trim(),
      role: role.value.trim(),
      stipend: stipend.value,
      description: description.value,
      savedAt: existing?.savedAt || new Date().toISOString(),
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      source: "extension",
      status: editingAppId
        ? statusSelect.value
        : existing?.status || "Saved",
    };

    // ---------------------------
    // EDIT MODE
    // ---------------------------
    if (editingAppId) {
      apps = apps.map((a) => (a.id === editingAppId ? entry : a));

      chrome.storage.local.set({ applications: apps }, () => {
        exitEditMode();
        showingSaved = true;
        newView.hidden = true;
        savedView.hidden = false;
        toggleBtn.textContent = "Back to New Application";
        loadSavedApplications();
      });
      return;
    }

    const exists = apps.some((a) => a.id === applicationId);

    if (exists && !duplicateConfirmed) {
      warningEl.textContent =
        "⚠ This application is already saved. Click Save again to update it.";
      warningEl.style.display = "block";
      duplicateConfirmed = true;
      return;
    }

    const index = apps.findIndex((a) => a.id === applicationId);
    if (index !== -1) apps[index] = entry;
    else apps.push(entry);

    chrome.storage.local.set({ applications: apps }, () => {
      chrome.runtime.sendMessage({ type: "CLEAR_LATEST_APPLICATION" });
      window.close();
    });
  });
});

// -------------------------------
// Saved Applications Viewer
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
          <button class="edit-btn">✏️ Edit</button>
          <button class="delete-btn">🗑️ Delete</button>
          ${
            app.status !== "Applied"
              ? `<button class="mark-applied-btn">✔ Mark as Applied</button>`
              : ""
          }
        </div>
      `;

      li.querySelector(".edit-btn").onclick = () => enterEditMode(app);
      li.querySelector(".delete-btn").onclick = () =>
        deleteApplication(app.applicationUrl);
      li.querySelector(".mark-applied-btn")?.addEventListener("click", () =>
        updateApplicationStatus(app.applicationUrl)
      );

      list.appendChild(li);
    });
  });
}

// -------------------------------
// Edit Mode Helpers
// -------------------------------
function enterEditMode(app) {
  editingAppId = app.id;
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
