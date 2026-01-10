console.log("[Internly][Background] Service worker running");

let latestApplication = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "APPLICATION_EXTRACTED") {
    latestApplication = {
      ...message.payload,
      sourceTabId: sender.tab?.id || null,
    };
    console.log("[Internly][Background] Stored", latestApplication);
  }

  if (message.type === "GET_LATEST_APPLICATION") {
    sendResponse({ application: latestApplication });
  }

  if (message.type === "CLEAR_LATEST_APPLICATION") {
    latestApplication = null;
  }

  return true;
});
