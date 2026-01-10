// utils/validate.js

export function validateApplication(app) {
  if (!app) return false;
  if (!app.applicationUrl) return false;
  if (!app.company || typeof app.company !== "string") return false;
  if (!app.role || typeof app.role !== "string") return false;

  app.status = app.status || "Saved";
  app.updatedAt = Date.now();

  return true;
}
