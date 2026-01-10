// utils/storage.js

import { migrateStorage } from "./migrate.js";

const STORAGE_KEY = "internly";

export function loadStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const raw = result[STORAGE_KEY] || {};
      const migrated = migrateStorage(raw);

      chrome.storage.local.set({ [STORAGE_KEY]: migrated });
      resolve(migrated);
    });
  });
}

export function saveStorage(data) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    } catch (err) {
      reject(err);
    }
  });
}
