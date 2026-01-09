/**
 * Background Service Worker
 * Handles API communication, deduplication, and sync logic
 */

import { ApplicationData } from '../utils/detectors';
import { storeApplication, markAsSynced, getUnsyncedApplications, removeApplication, StoredApplication } from '../utils/storage';

interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Get authentication token
 */
async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

/**
 * Get API URL from settings
 */
async function getApiUrl(): Promise<string> {
  const settings = await chrome.storage.local.get(['settings']);
  return settings.settings?.apiUrl || 'http://localhost:3000';
}

/**
 * Sync application to backend
 */
async function syncApplication(application: StoredApplication): Promise<SyncResult> {
  const token = await getAuthToken();
  if (!token) {
    return {
      success: false,
      error: 'Not authenticated. Please connect the extension from your dashboard.'
    };
  }

  const apiUrl = await getApiUrl();
  const url = `${apiUrl}/api/internships`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        company: application.data.company,
        role: application.data.role,
        location: application.data.location,
        url: application.data.jobUrl,
        status: 'Applied'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || `Server error: ${response.status}`
      };
    }

    const data = await response.json();
    await markAsSynced(application.hash);

    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sync application'
    };
  }
}

/**
 * Sync all unsynced applications
 */
async function syncAllUnsynced(): Promise<{ success: number; failed: number; errors: string[] }> {
  const unsynced = await getUnsyncedApplications();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const application of unsynced) {
    const result = await syncApplication(application);
    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push(`${application.data.company} - ${application.data.role}: ${result.error}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Show browser notification
 */
function showBrowserNotification(title: string, message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
}

/**
 * Handle application detected message from content script
 */
async function handleApplicationDetected(data: ApplicationData, hash: string) {
  try {
    // Store locally first
    const stored = await storeApplication(data);
    
    // Try to sync immediately
    const syncResult = await syncApplication(stored);
    
    if (syncResult.success) {
      showBrowserNotification(
        'Application Tracked ✅',
        `${data.company} - ${data.role}`
      );
    } else {
      // Still stored locally, will sync later
      showBrowserNotification(
        'Application Saved Locally',
        `Will sync when online: ${data.company} - ${data.role}`
      );
    }
  } catch (error: any) {
    if (error.message === 'Duplicate application') {
      // Silently ignore duplicates
      return;
    }
    console.error('Failed to handle application:', error);
  }
}

/**
 * Message handler
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle application detection from content script
  if (message.type === 'APPLICATION_DETECTED') {
    handleApplicationDetected(message.data, message.hash).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open
  }

  // Handle manual sync request
  if (message.type === 'SYNC_ALL') {
    syncAllUnsynced().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  // Handle sync single application
  if (message.type === 'SYNC_APPLICATION') {
    // Find application by hash
    chrome.storage.local.get(['applications'], async (result) => {
      const applications: StoredApplication[] = result.applications || [];
      const app = applications.find(a => a.hash === message.hash);
      
      if (!app) {
        sendResponse({ success: false, error: 'Application not found' });
        return;
      }

      const syncResult = await syncApplication(app);
      sendResponse(syncResult);
    });
    return true;
  }

  // Handle remove application
  if (message.type === 'REMOVE_APPLICATION') {
    removeApplication(message.hash).then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  // Handle token storage (from dashboard)
  if (message.type === 'STORE_TOKEN') {
    chrome.storage.local.set({ authToken: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

/**
 * Periodic sync - sync unsynced applications every 5 minutes
 */
chrome.alarms.create('syncUnsynced', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncUnsynced') {
    syncAllUnsynced().then((result) => {
      if (result.success > 0) {
        console.log(`Synced ${result.success} applications`);
      }
      if (result.failed > 0) {
        console.error(`Failed to sync ${result.failed} applications`);
      }
    });
  }
});

/**
 * Sync on extension startup
 */
chrome.runtime.onStartup.addListener(() => {
  syncAllUnsynced();
});

// Also sync when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  syncAllUnsynced();
});

