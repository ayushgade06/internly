console.log("[Internly][Popup] Popup loaded");

document.getElementById("testBtn").addEventListener("click", () => {
  console.log("[Internly][Popup] Test Connection clicked");

  chrome.runtime.sendMessage({ type: "PING" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        "[Internly][Popup] Error:",
        chrome.runtime.lastError.message
      );
      return;
    }

    console.log("[Internly][Popup] Ping response", response);
  });
});
