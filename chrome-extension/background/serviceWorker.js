


let latestApplication = null;

async function saveLatestApplication(app) {
  latestApplication = app;
  await chrome.storage.local.set({ latestApplication: app });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "APPLICATION_EXTRACTED") {
    saveLatestApplication({
      ...message.payload,
      capturedAt: new Date().toISOString(),
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "APPLICATION_SUBMITTED") {
    chrome.storage.local.get(["applications"], (res) => {
      const apps = res.applications || [];

      const updated = apps.map((a) =>
        a.applicationUrl === message.payload.applicationUrl
          ? {
              ...a,
              status: "Applied",
              updatedAt: new Date().toISOString(),
            }
          : a
      );

      chrome.storage.local.set({ applications: updated }, () => {
        chrome.runtime.sendMessage({ type: "SYNC_APPLICATIONS" });
      });
    });

    sendResponse({ ok: true });
    return true;
  }

  if (message.type === "GET_LATEST_APPLICATION") {
    chrome.storage.local.get("latestApplication", (res) => {
      sendResponse({ application: res.latestApplication || null });
    });
    return true;
  }

  if (message.type === "CLEAR_LATEST_APPLICATION") {
    latestApplication = null;
    chrome.storage.local.remove("latestApplication");
    sendResponse({ ok: true });
    return true;
  }

  // Final sync handler to send applications to the backend

  if (message.type === "SYNC_APPLICATIONS") {
    chrome.storage.local.get(
      ["applications", "authToken", "apiBase"],
      async (res) => {
        const { applications: localApps, authToken, apiBase } = res;
        const activeApiBase = apiBase || "http://localhost:3000";

        if (!authToken) {
          sendResponse({ ok: false });
          return;
        }

        try {
          // 1. PULL: Get latest from server to handle deletions on website
          const listResp = await fetch(`${activeApiBase}/api/internly/applications/list`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });

          if (listResp.ok) {
            const { applications: serverApps } = await listResp.json();
            const serverMap = new Map(serverApps.map(app => [app.applicationId, app]));
            
            // Identify what to keep locally:
            const updatedLocalApps = (localApps || []).filter(local => {
               const onServer = serverMap.has(local.applicationId);
               
               // If it's NOT on server, but we previously synced it, 
               // it means the Website must have deleted it.
               if (!onServer && local.source === "extension" && local.synced === true) {
                 return false; 
               }
               return true;
            });

            // Update local storage with filtered list
            if (updatedLocalApps.length !== (localApps || []).length) {
              await chrome.storage.local.set({ applications: updatedLocalApps });
            }
          }

          // 2. PUSH: Send current local state to server
          const { applications: currentLocal } = await chrome.storage.local.get("applications");
          const toPush = currentLocal || [];
          
          const pushResp = await fetch(
            `${activeApiBase}/api/internly/applications/upsert`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ applications: toPush }),
            }
          );

          if (pushResp.ok) {
            // Mark all pushed apps as synced: true
            const finalized = toPush.map(app => ({ ...app, synced: true }));
            await chrome.storage.local.set({ applications: finalized });
          }

          sendResponse({ ok: true });
        } catch (err) {
          sendResponse({ ok: false });
        }
      }
    );

    return true;
  }

  // Delete from server (triggered by extension popup)
  if (message.type === "DELETE_REMOTE_APPLICATION") {
    chrome.storage.local.get(["authToken", "apiBase"], async (res) => {
      const { authToken, apiBase } = res;
      const activeApiBase = apiBase || "http://localhost:3000";

      if (!authToken) {
        sendResponse({ ok: false, error: "No auth token" });
        return;
      }

      try {
        const resp = await fetch(
          `${activeApiBase}/api/internly/applications/delete?applicationId=${encodeURIComponent(
            message.applicationId
          )}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await resp.json();
        sendResponse({ ok: resp.ok, data });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    });
    return true;
  }

  // Remove an application from local storage when deleted on the website
  if (message.type === "DELETE_LOCAL_APPLICATION") {
    chrome.storage.local.get(["applications"], (res) => {
      const apps = res.applications || [];
      const updated = apps.filter((a) => a.applicationId !== message.applicationId);
      chrome.storage.local.set({ applications: updated }, () => {
        sendResponse({ ok: true });
      });
    });
    return true;
  }

  return true;
});
