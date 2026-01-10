let duplicateConfirmed = false;
let showingSaved = false;
let editingIndex = null; // ✅ NEW: tracks which entry is being edited

const newView = document.getElementById("newView");
const savedView = document.getElementById("savedView");
const toggleBtn = document.getElementById("toggleViewBtn");
const form = document.getElementById("applicationForm");
const saveBtn = form.querySelector('button[type="submit"]');

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

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage(
    { type: "GET_LATEST_APPLICATION" },
    (response) => {
      const app = response?.application;

      if (!app) {
        form.hidden = true;
        document.getElementById("emptyState").hidden = false;
        return;
      }

      document.getElementById("confidence").textContent =
        "Confidence: " + app.confidence;

      company.value = app.company || "";
      role.value = app.role || "";
      stipend.value = app.stipend || "";
      description.value = app.description || "";
    }
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const warningEl = document.getElementById("warning");

  const entry = {
    company: company.value.trim(),
    role: role.value.trim(),
    stipend: stipend.value,
    description: description.value,
    savedAt: new Date().toISOString(),
  };

  chrome.storage.local.get(["applications"], (res) => {
    const apps = res.applications || [];

    // 📝 EDIT MODE → REPLACE ENTRY
    if (editingIndex !== null) {
      apps[editingIndex] = entry;

      chrome.storage.local.set({ applications: apps }, () => {
        exitEditMode();
        loadSavedApplications();
      });

      return;
    }

    // ➕ CREATE MODE → DUPLICATE CHECK
    const isDuplicate = apps.some(
      (a) =>
        a.company?.toLowerCase() === entry.company.toLowerCase() &&
        a.role?.toLowerCase() === entry.role.toLowerCase()
    );

    if (isDuplicate && !duplicateConfirmed) {
      warningEl.textContent =
        "⚠ Duplicate detected. Click Save again to confirm.";
      warningEl.style.display = "block";
      duplicateConfirmed = true;
      return;
    }

    apps.push(entry);

    chrome.storage.local.set({ applications: apps }, () => {
      chrome.runtime.sendMessage({ type: "CLEAR_LATEST_APPLICATION" });
      window.close();
    });
  });
});

document.getElementById("ignoreBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CLEAR_LATEST_APPLICATION" });
  window.close();
});

// ===============================
// Saved Applications Viewer
// ===============================
function loadSavedApplications() {
  const list = document.getElementById("savedList");
  list.innerHTML = "";

  chrome.storage.local.get(["applications"], (res) => {
    const apps = res.applications || [];

    if (apps.length === 0) {
      list.innerHTML = "<li>No saved applications yet.</li>";
      return;
    }

    apps.forEach((app, index) => {
      const li = document.createElement("li");
      li.className = "saved-item";
      li.style.cursor = "pointer";

      li.innerHTML = `
        <strong>${app.company}</strong><br/>
        <span>${app.role}</span><br/>
        <span>Saved: ${new Date(app.savedAt).toLocaleDateString()}</span>
      `;

      // ✏️ CLICK → EDIT MODE
      li.addEventListener("click", () => {
        enterEditMode(app, index);
      });

      list.appendChild(li);
    });
  });
}

// ===============================
// Edit Mode Helpers
// ===============================
function enterEditMode(app, index) {
  editingIndex = index;
  duplicateConfirmed = true; // skip duplicate check when editing

  company.value = app.company || "";
  role.value = app.role || "";
  stipend.value = app.stipend || "";
  description.value = app.description || "";

  saveBtn.textContent = "Update";

  newView.hidden = false;
  savedView.hidden = true;
  toggleBtn.textContent = "Back to Saved Applications";
}

function exitEditMode() {
  editingIndex = null;
  duplicateConfirmed = false;

  form.reset();
  saveBtn.textContent = "Save";

  newView.hidden = false;
  savedView.hidden = true;
  toggleBtn.textContent = "View Saved Applications";
}
