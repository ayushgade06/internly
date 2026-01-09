/*************************
 * SITE-SPECIFIC EXTRACTORS
 *************************/

function extractLinkedInData() {
  return {
    company: document.querySelector(
      ".jobs-unified-top-card__company-name"
    )?.innerText?.trim(),

    role: document.querySelector(
      ".jobs-unified-top-card__job-title"
    )?.innerText?.trim(),

    location: document.querySelector(
      ".jobs-unified-top-card__bullet"
    )?.innerText?.trim(),

    url: window.location.href,
    date: new Date().toISOString(),
  };
}

function extractGenericData() {
  return {
    company:
      document.querySelector("meta[property='og:site_name']")?.content ||
      document.title,

    role: document.querySelector("h1")?.innerText?.trim(),

    url: window.location.href,
    date: new Date().toISOString(),
  };
}

/*************************
 * SELECT EXTRACTOR
 *************************/

const host = window.location.hostname;

window.extractData = host.includes("linkedin.com")
  ? extractLinkedInData
  : extractGenericData;

/*************************
 * LISTEN FOR TOKEN FROM DASHBOARD
 *************************/

window.addEventListener("message", (event) => {
  // 🔒 Security checks
  if (event.source !== window) return;
  if (!event.data) return;
  if (event.data.type !== "AUTH_TOKEN") return;

  chrome.runtime.sendMessage({
    type: "STORE_TOKEN",
    token: event.data.token,
  });
});

/*************************
 * LISTEN FOR POPUP REQUEST
 *************************/

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_DATA") {
    try {
      const data = window.extractData();
      if (!data || (!data.company && !data.role)) {
        sendResponse({ error: "Could not extract job data. Please make sure you're on a job posting page." });
        return;
      }
      sendResponse(data);
    } catch (error) {
      console.error("Error extracting data:", error);
      sendResponse({ error: error.message || "Failed to extract data" });
    }
  }
  return true; // Keep the message channel open for async response
});
