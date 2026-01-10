// ===============================
// Internly – Data Extraction Engine
// Phase 3 (FINAL)
// ===============================

// ---------- Utilities ----------
function safeText(el, maxLen = 300) {
  try {
    if (!el || !el.innerText) return null;
    return el.innerText.trim().slice(0, maxLen) || null;
  } catch {
    return null;
  }
}

function computeFollowUpDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isGenericTitle(text) {
  if (!text) return true;
  const generic = [
    "jobs",
    "careers",
    "open roles",
    "job openings",
    "positions",
    "join us"
  ];
  return generic.includes(text.toLowerCase().trim());
}

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- Company ----------
function extractCompany() {
  try {
    // 1️⃣ Hostname inference (MOST reliable across ATS)
    const host = window.location.hostname.replace("www.", "");
    const brand = host.split(".")[0];

    if (brand && brand.length > 2) {
      return titleCase(brand);
    }

    // 2️⃣ Meta fallback
    const meta =
      document.querySelector('meta[property="og:site_name"]') ||
      document.querySelector('meta[name="application-name"]');

    if (meta?.content) return meta.content.trim();

    return null;
  } catch {
    return null;
  }
}

// ---------- Role ----------
function extractRole() {
  try {
    // 1️⃣ Headings (best when present)
    const headings = document.querySelectorAll("h1, h2, h3");

    for (const h of headings) {
      const text = safeText(h, 200);
      if (!text) continue;

      if (
        !isGenericTitle(text) &&
        text.length > 10 &&
        text.length < 120
      ) {
        return text;
      }
    }

    // 2️⃣ URL slug fallback (CRITICAL for Stripe / Greenhouse / Lever)
    const path = window.location.pathname;

    // Common ATS patterns
    const slugMatch =
      path.match(/listing\/([^\/]+)/i) ||
      path.match(/jobs\/([^\/]+)/i) ||
      path.match(/positions\/([^\/]+)/i);

    if (slugMatch && slugMatch[1]) {
      return titleCase(slugMatch[1].replace(/-/g, " "));
    }

    // 3️⃣ Document title (only if not generic)
    const title = document.title;
    if (title && !isGenericTitle(title)) {
      return title.split("|")[0].trim();
    }

    return null;
  } catch {
    return null;
  }
}

// ---------- Stipend / Salary ----------
function extractStipend() {
  try {
    const text = document.body.innerText.toLowerCase();

    const match = text.match(
      /(stipend|salary|ctc|pay)[^\d]{0,20}(\₹|\$)?\s?\d+(\.\d+)?\s?(k|l|lpa)?/i
    );

    return match ? match[0].trim() : null;
  } catch {
    return null;
  }
}

// ---------- Description ----------
function extractDescription() {
  try {
    const keywords = [
      "job description",
      "responsibilities",
      "about the role",
      "what you will do",
      "requirements",
      "qualifications"
    ];

    const blocks = document.querySelectorAll("section, article, div");

    for (const el of blocks) {
      const text = el.innerText;
      if (!text || text.length < 120) continue;

      const lower = text.toLowerCase();
      if (keywords.some((k) => lower.includes(k))) {
        return text.trim().slice(0, 2000);
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ---------- MAIN EXPORT ----------
export function extractApplicationData() {
  try {
    return {
      company: extractCompany(),
      role: extractRole(),
      stipend: extractStipend(),
      description: extractDescription(),
      applicationUrl: window.location.href,
      appliedAt: new Date().toISOString(),
      followUpAt: computeFollowUpDate(7)
    };
  } catch {
    return {
      applicationUrl: window.location.href,
      appliedAt: new Date().toISOString(),
      followUpAt: computeFollowUpDate(7)
    };
  }
}
