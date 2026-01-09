export async function apiFetch(path, options = {}) {
  const { authToken } = await chrome.storage.local.get("authToken");

  if (!authToken) {
    throw new Error("Not authenticated");
  }

  return fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
}
