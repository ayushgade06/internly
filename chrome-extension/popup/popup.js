document.getElementById("extract").onclick = async () => {
  const statusDiv = document.getElementById("status");
  const button = document.getElementById("extract");
  
  // Reset status
  statusDiv.className = "";
  statusDiv.style.display = "none";
  button.disabled = true;
  button.textContent = "Processing...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error("Could not get active tab");
    }

    // Send message to content script to extract data
    const data = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_DATA" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No data extracted. Please make sure you're on a job posting page."));
          return;
        }
        resolve(response);
      });
    });

    // Send to background script to save to backend
    const saveResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "SAVE_APPLICATION",
          data
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        }
      );
    });

    if (saveResponse?.success) {
      statusDiv.className = "success";
      statusDiv.textContent = "✅ Application saved successfully!";
      statusDiv.style.display = "block";
      button.textContent = "Save This Application";
    } else {
      throw new Error(saveResponse?.error || "Unknown error occurred");
    }
  } catch (error) {
    statusDiv.className = "error";
    statusDiv.textContent = `❌ ${error.message}`;
    statusDiv.style.display = "block";
    button.textContent = "Save This Application";
    console.error("Error:", error);
  } finally {
    button.disabled = false;
  }
};
