// utils/sync.js
// Token-based Push Sync (FINAL)


const API_BASE = "http://localhost:3000/api/internly";

/**
 * Push local applications to backend
 * Offline-first, silent failures
 */
export async function syncApplications(applications) {
  if (!Array.isArray(applications) || applications.length === 0) return;

  // Get the auth token issued by the website

  const { authToken } = await chrome.storage.local.get("authToken");

  if (!authToken) {

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
          applicationId: app.applicationId, 

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

      return;
    }


  } catch (err) {

    // Fail silently to support offline-first behavior

  }
}
