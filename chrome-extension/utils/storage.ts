/**
 * Storage utilities for Chrome Extension
 * Handles local storage, deduplication, and data persistence
 */

import { ApplicationData } from './detectors';

export interface StoredApplication {
  data: ApplicationData;
  hash: string;
  synced: boolean;
  syncedAt?: string;
  createdAt: string;
}

/**
 * Generate a hash for duplicate detection
 * Uses company + role + jobUrl to create unique identifier
 */
export function generateHash(data: ApplicationData): string {
  const normalized = {
    company: data.company.toLowerCase().trim(),
    role: data.role.toLowerCase().trim(),
    url: data.jobUrl.toLowerCase().trim()
  };
  
  const hashString = `${normalized.company}|${normalized.role}|${normalized.url}`;
  
  // Simple hash function (for production, consider using crypto.subtle)
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Check if application already exists (duplicate detection)
 */
export async function isDuplicate(hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['applications'], (result) => {
      const applications: StoredApplication[] = result.applications || [];
      const exists = applications.some(app => app.hash === hash);
      resolve(exists);
    });
  });
}

/**
 * Store application locally
 */
export async function storeApplication(data: ApplicationData): Promise<StoredApplication> {
  return new Promise((resolve, reject) => {
    const hash = generateHash(data);
    const storedApp: StoredApplication = {
      data,
      hash,
      synced: false,
      createdAt: new Date().toISOString()
    };

    chrome.storage.local.get(['applications'], (result) => {
      const applications: StoredApplication[] = result.applications || [];
      
      // Check for duplicates
      if (applications.some(app => app.hash === hash)) {
        reject(new Error('Duplicate application'));
        return;
      }

      applications.push(storedApp);
      
      chrome.storage.local.set({ applications }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(storedApp);
        }
      });
    });
  });
}

/**
 * Mark application as synced
 */
export async function markAsSynced(hash: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['applications'], (result) => {
      const applications: StoredApplication[] = result.applications || [];
      const index = applications.findIndex(app => app.hash === hash);
      
      if (index === -1) {
        reject(new Error('Application not found'));
        return;
      }

      applications[index].synced = true;
      applications[index].syncedAt = new Date().toISOString();
      
      chrome.storage.local.set({ applications }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Get all stored applications
 */
export async function getStoredApplications(): Promise<StoredApplication[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['applications'], (result) => {
      resolve(result.applications || []);
    });
  });
}

/**
 * Get unsynced applications
 */
export async function getUnsyncedApplications(): Promise<StoredApplication[]> {
  const all = await getStoredApplications();
  return all.filter(app => !app.synced);
}

/**
 * Remove application from storage
 */
export async function removeApplication(hash: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['applications'], (result) => {
      const applications: StoredApplication[] = result.applications || [];
      const filtered = applications.filter(app => app.hash !== hash);
      
      chrome.storage.local.set({ applications: filtered }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Clear all stored applications
 */
export async function clearAllApplications(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ applications: [] }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get extension settings
 */
export async function getSettings(): Promise<{
  enabled: boolean;
  platforms: string[];
  debug: boolean;
  apiUrl: string;
}> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['settings'], (result) => {
      const defaultSettings = {
        enabled: true,
        platforms: ['linkedin', 'internshala', 'greenhouse', 'lever', 'workday'],
        debug: false,
        apiUrl: 'http://localhost:3000'
      };
      resolve(result.settings || defaultSettings);
    });
  });
}

/**
 * Save extension settings
 */
export async function saveSettings(settings: Partial<{
  enabled: boolean;
  platforms: string[];
  debug: boolean;
  apiUrl: string;
}>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['settings'], (result) => {
      const currentSettings = result.settings || {};
      const newSettings = { ...currentSettings, ...settings };
      
      chrome.storage.local.set({ settings: newSettings }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  });
}

