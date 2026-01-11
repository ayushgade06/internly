// utils/sync.js
// Phase 6.6 — Token-based Push Sync (FINAL)

const API_BASE = "http://localhost:3000/api/internly";

/**
 * Push local applications to backend
 * Offline-first, silent failures
 */
export async function syncApplications(applications) {
  if (!Array.isArray(applications) || applications.length === 0) return;

  // 🔐 Get auth token issued by website
  const { authToken } = await chrome.storage.local.get("authToken");

  if (!authToken) {
    console.warn("[Internly][Sync] No auth token — skipping sync");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/applications/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        applications: applications.map((app) => ({
          applicationId: app.applicationId, // 🔑 NEW
          applicationUrl: app.applicationUrl,
          company: app.company,
          role: app.role,
          stipend: app.stipend,
          description: app.description,
          status: app.status,
          source: app.source || "extension",
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        })),
      }),
    });

    if (!res.ok) {
      console.warn(
        "[Internly][Sync] Push failed:",
        res.status,
        await res.text()
      );
      return;
    }

    console.log("[Internly][Sync] Push sync successful");
  } catch (err) {
    console.error("[Internly][Sync] Network error (offline-safe)", err);
    // ❗ DO NOT throw — offline-first
  }
}
