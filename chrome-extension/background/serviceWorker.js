console.log("[Internly][Background] Service worker running");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    console.log("[Internly][Background] Message received from popup");

    sendResponse({ ok: true });
    return true; // keeps the message channel open
  }
});
