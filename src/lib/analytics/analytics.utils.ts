// src/lib/analytics/analytics.utils.ts

export function calculateRate(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      d.toLocaleDateString("en-IN", { weekday: "short" })
    );
  }
  return days;
}

/**
 * 🔑 IMPORTANT:
 * Normalizes status strings coming from DB
 * Handles case + whitespace issues
 */
export function normalizeStatus(status: string): string {
  return status.trim().toUpperCase();
}
