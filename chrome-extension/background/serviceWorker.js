


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
        const { applications, authToken, apiBase } = res;
        const activeApiBase = apiBase || "http://localhost:3000";

        if (!authToken || !applications?.length) {

          sendResponse({ ok: false });
          return;
        }

        try {


          const resp = await fetch(
            `${activeApiBase}/api/internly/applications/upsert`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ applications }),
            }
          );


          sendResponse({ ok: true });
        } catch (err) {

          sendResponse({ ok: false });
        }
      }
    );

    return true;
  }

  return true;
});
