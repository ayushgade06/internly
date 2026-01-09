/**
 * Content Script - Runs on job board pages
 * Monitors DOM for application success and extracts data
 */

import { detectPlatform, detectApplicationSuccess, setupButtonClickMonitor, ApplicationData } from '../utils/detectors';
import { scrapeJobData, validateScrapedData } from '../utils/scrapers';
import { generateHash, isDuplicate } from '../utils/storage';

// State management
let isMonitoring = false;
let hasDetected = false;
let cleanupClickMonitor: (() => void) | null = null;
let lastDetectedHash: string | null = null;

/**
 * Log debug messages if debug mode is enabled
 */
async function debugLog(message: string, data?: any) {
  const settings = await chrome.storage.local.get(['settings']);
  if (settings.settings?.debug) {
    console.log(`[Internship Tracker] ${message}`, data || '');
  }
}

/**
 * Main detection function
 */
async function detectAndExtract(): Promise<void> {
  if (hasDetected) {
    await debugLog('Already detected application on this page');
    return;
  }

  const platform = detectPlatform();
  if (platform === 'unknown') {
    await debugLog('Unknown platform, skipping detection');
    return;
  }

  await debugLog(`Detecting on platform: ${platform}`);

  // Check if application was successful
  const isSuccess = detectApplicationSuccess(platform);
  if (!isSuccess) {
    await debugLog('Application success not detected yet');
    return;
  }

  // Extract job data
  const scrapedData = scrapeJobData(platform);
  if (!validateScrapedData(scrapedData)) {
    await debugLog('Failed to extract valid job data', scrapedData);
    return;
  }

  // Build complete application data
  const applicationData: ApplicationData = {
    company: scrapedData.company!,
    role: scrapedData.role!,
    platform,
    jobUrl: scrapedData.jobUrl!,
    appliedAt: new Date().toISOString(),
    location: scrapedData.location,
    mode: scrapedData.mode
  };

  // Check for duplicates
  const hash = generateHash(applicationData);
  if (hash === lastDetectedHash) {
    await debugLog('Duplicate hash detected, skipping');
    return;
  }

  const isDup = await isDuplicate(hash);
  if (isDup) {
    await debugLog('Duplicate application found in storage');
    hasDetected = true;
    return;
  }

  await debugLog('Application detected!', applicationData);

  // Send to background script
  chrome.runtime.sendMessage({
    type: 'APPLICATION_DETECTED',
    data: applicationData,
    hash
  }, (response) => {
    if (response?.success) {
      hasDetected = true;
      lastDetectedHash = hash;
      showNotification('Application detected! ✅');
    } else {
      await debugLog('Failed to save application', response?.error);
    }
  });
}

/**
 * Show a visual notification on the page
 */
function showNotification(message: string) {
  // Remove existing notification if any
  const existing = document.getElementById('internship-tracker-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'internship-tracker-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Setup DOM observer to watch for changes
 */
function setupDOMObserver() {
  const observer = new MutationObserver(() => {
    if (!hasDetected && isMonitoring) {
      detectAndExtract();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  return () => observer.disconnect();
}

/**
 * Initialize monitoring
 */
async function initializeMonitoring() {
  if (isMonitoring) {
    await debugLog('Already monitoring');
    return;
  }

  const settings = await chrome.storage.local.get(['settings']);
  if (settings.settings?.enabled === false) {
    await debugLog('Extension is disabled');
    return;
  }

  const platform = detectPlatform();
  if (platform === 'unknown') {
    await debugLog('Unknown platform, not monitoring');
    return;
  }

  const enabledPlatforms = settings.settings?.platforms || ['linkedin', 'internshala', 'greenhouse', 'lever', 'workday'];
  if (!enabledPlatforms.includes(platform)) {
    await debugLog(`Platform ${platform} is disabled`);
    return;
  }

  isMonitoring = true;
  await debugLog('Starting monitoring...');

  // Initial check
  detectAndExtract();

  // Setup button click monitor
  cleanupClickMonitor = setupButtonClickMonitor(() => {
    setTimeout(() => {
      detectAndExtract();
    }, 2000);
  });

  // Setup DOM observer
  const cleanupObserver = setupDOMObserver();

  // Also check on URL changes (for SPAs)
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      hasDetected = false; // Reset detection on navigation
      detectAndExtract();
    }
  }, 1000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (cleanupClickMonitor) cleanupClickMonitor();
    cleanupObserver();
  });
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_APPLICATION') {
    detectAndExtract().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async
  }

  if (message.type === 'RESET_DETECTION') {
    hasDetected = false;
    lastDetectedHash = null;
    sendResponse({ success: true });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMonitoring);
} else {
  initializeMonitoring();
}

// Also initialize after a short delay to catch dynamic content
setTimeout(initializeMonitoring, 2000);

