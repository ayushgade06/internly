document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage(
    { type: "GET_LATEST_APPLICATION" },
    (response) => {
      const app = response?.application;

      if (!app) {
        document.getElementById("applicationForm").hidden = true;
        document.getElementById("emptyState").hidden = false;
        return;
      }

      document.getElementById("confidence").textContent =
        "Confidence: " + app.confidence;

      document.getElementById("company").value = app.company || "";
      document.getElementById("role").value = app.role || "";
      document.getElementById("stipend").value = app.stipend || "";
      document.getElementById("description").value = app.description || "";
    }
  );
});

document
  .getElementById("applicationForm")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    const entry = {
      company: company.value,
      role: role.value,
      stipend: stipend.value,
      description: description.value,
      savedAt: new Date().toISOString(),
    };

    chrome.storage.local.get(["applications"], (res) => {
      const apps = res.applications || [];
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
