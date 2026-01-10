// utils/migrate.js

export const CURRENT_SCHEMA_VERSION = 1;

export function migrateStorage(data) {
  let version = data.schemaVersion ?? 0;
  let migrated = { ...data };

  if (version === 0) {
    migrated = migrateV0toV1(migrated);
    version = 1;
  }

  migrated.schemaVersion = version;
  return migrated;
}

function migrateV0toV1(data) {
  return {
    schemaVersion: 1,
    applications: (data.applications || []).map(app => ({
      ...app,
      createdAt: app.createdAt || app.savedAt || Date.now(),
      updatedAt: app.updatedAt || Date.now(),
      source: app.source || "extension"
    }))
  };
}
