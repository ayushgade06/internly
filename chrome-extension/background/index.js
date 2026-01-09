// Listen for token storage requests from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "STORE_TOKEN") {
    // Store the token in Chrome storage
    chrome.storage.local.set({ authToken: msg.token }, () => {
      console.log("Token stored successfully");
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }

  if (msg.type === "SAVE_APPLICATION") {
    // Get the stored token
    chrome.storage.local.get(["authToken"], async (result) => {
      const token = result.authToken;

      if (!token) {
        console.error("No token found. Please connect the extension first.");
        sendResponse({ success: false, error: "Not authenticated. Please connect the extension from your dashboard first." });
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/internships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(msg.data)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to save application" }));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Application saved:", data);
        sendResponse({ success: true, data });
      } catch (error) {
        console.error("Failed to save application:", error);
        sendResponse({ 
          success: false, 
          error: error.message || "Failed to connect to server. Make sure the app is running on localhost:3000." 
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});
