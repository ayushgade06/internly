/**
 * Popup UI Controller
 * Manages the popup interface and user interactions
 */

import { getStoredApplications, getUnsyncedApplications, StoredApplication } from '../utils/storage';
import { getSettings, saveSettings } from '../utils/storage';

// UI Elements
const statusIndicator = document.getElementById('statusIndicator')!;
const statusDot = document.getElementById('statusDot')!;
const statusText = document.getElementById('statusText')!;
const recentSection = document.getElementById('recentSection')!;
const recentCard = document.getElementById('recentCard')!;
const platformBadge = document.getElementById('platformBadge')!;
const syncStatus = document.getElementById('syncStatus')!;
const recentCompany = document.getElementById('recentCompany')!;
const recentRole = document.getElementById('recentRole')!;
const recentDate = document.getElementById('recentDate')!;
const editBtn = document.getElementById('editBtn')!;
const undoBtn = document.getElementById('undoBtn')!;
const syncBtn = document.getElementById('syncBtn')!;
const totalCount = document.getElementById('totalCount')!;
const syncedCount = document.getElementById('syncedCount')!;
const pendingCount = document.getElementById('pendingCount')!;
const syncAllBtn = document.getElementById('syncAllBtn')!;
const settingsBtn = document.getElementById('settingsBtn')!;
const settingsSection = document.getElementById('settingsSection')!;
const enabledToggle = document.getElementById('enabledToggle') as HTMLInputElement;
const debugToggle = document.getElementById('debugToggle') as HTMLInputElement;
const apiUrlInput = document.getElementById('apiUrlInput') as HTMLInputElement;
const saveSettingsBtn = document.getElementById('saveSettingsBtn')!;
const emptyState = document.getElementById('emptyState')!;

let currentApplication: StoredApplication | null = null;

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Update status indicator
 */
async function updateStatus() {
  const token = await chrome.storage.local.get(['authToken']);
  if (token.authToken) {
    statusDot.className = 'status-dot active';
    statusText.textContent = 'Connected';
  } else {
    statusDot.className = 'status-dot error';
    statusText.textContent = 'Not Connected';
  }
}

/**
 * Load and display applications
 */
async function loadApplications() {
  const applications = await getStoredApplications();
  const unsynced = await getUnsyncedApplications();

  // Update stats
  totalCount.textContent = applications.length.toString();
  syncedCount.textContent = (applications.length - unsynced.length).toString();
  pendingCount.textContent = unsynced.length.toString();

  // Show most recent application
  if (applications.length > 0) {
    const mostRecent = applications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    currentApplication = mostRecent;
    displayRecentApplication(mostRecent);
    recentSection.style.display = 'block';
    emptyState.style.display = 'none';
  } else {
    recentSection.style.display = 'none';
    emptyState.style.display = 'block';
  }
}

/**
 * Display recent application
 */
function displayRecentApplication(app: StoredApplication) {
  platformBadge.textContent = app.data.platform;
  platformBadge.style.background = getPlatformColor(app.data.platform);
  
  if (app.synced) {
    syncStatus.textContent = 'Synced';
    syncStatus.className = 'status-badge';
  } else {
    syncStatus.textContent = 'Pending';
    syncStatus.className = 'status-badge pending';
  }

  recentCompany.textContent = app.data.company;
  recentRole.textContent = app.data.role;
  recentDate.textContent = formatDate(app.data.appliedAt);
}

/**
 * Get platform color
 */
function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    linkedin: '#0077b5',
    internshala: '#00a5ec',
    greenhouse: '#00a551',
    lever: '#0d96f2',
    workday: '#ff6b35'
  };
  return colors[platform] || '#3b82f6';
}

/**
 * Load settings
 */
async function loadSettings() {
  const settings = await getSettings();
  enabledToggle.checked = settings.enabled;
  debugToggle.checked = settings.debug;
  apiUrlInput.value = settings.apiUrl;

  // Set platform checkboxes
  document.querySelectorAll('.platform-checkbox').forEach((checkbox) => {
    const input = checkbox as HTMLInputElement;
    input.checked = settings.platforms.includes(input.value);
  });
}

/**
 * Initialize popup
 */
async function init() {
  await updateStatus();
  await loadApplications();
  await loadSettings();

  // Setup event listeners
  editBtn.addEventListener('click', () => {
    if (currentApplication) {
      // Open dashboard in new tab
      chrome.tabs.create({ url: 'http://localhost:3000/internships' });
    }
  });

  undoBtn.addEventListener('click', async () => {
    if (currentApplication) {
      if (confirm('Remove this application from tracking?')) {
        chrome.runtime.sendMessage({
          type: 'REMOVE_APPLICATION',
          hash: currentApplication.hash
        }, (response) => {
          if (response?.success) {
            loadApplications();
          }
        });
      }
    }
  });

  syncBtn.addEventListener('click', async () => {
    if (currentApplication && !currentApplication.synced) {
      syncBtn.textContent = 'Syncing...';
      syncBtn.disabled = true;

      chrome.runtime.sendMessage({
        type: 'SYNC_APPLICATION',
        hash: currentApplication.hash
      }, (response) => {
        syncBtn.textContent = 'Sync';
        syncBtn.disabled = false;

        if (response?.success) {
          loadApplications();
        } else {
          alert(`Failed to sync: ${response?.error}`);
        }
      });
    }
  });

  syncAllBtn.addEventListener('click', () => {
    syncAllBtn.textContent = 'Syncing...';
    syncAllBtn.disabled = true;

    chrome.runtime.sendMessage({ type: 'SYNC_ALL' }, (response) => {
      syncAllBtn.textContent = 'Sync All';
      syncAllBtn.disabled = false;

      if (response) {
        alert(`Synced ${response.success} applications. ${response.failed > 0 ? `Failed: ${response.failed}` : ''}`);
        loadApplications();
      }
    });
  });

  settingsBtn.addEventListener('click', () => {
    const isVisible = settingsSection.style.display !== 'none';
    settingsSection.style.display = isVisible ? 'none' : 'block';
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const platforms: string[] = [];
    document.querySelectorAll('.platform-checkbox:checked').forEach((checkbox) => {
      platforms.push((checkbox as HTMLInputElement).value);
    });

    await saveSettings({
      enabled: enabledToggle.checked,
      debug: debugToggle.checked,
      apiUrl: apiUrlInput.value,
      platforms
    });

    alert('Settings saved!');
    settingsSection.style.display = 'none';
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

