// Internly - Data Extraction Engine


// Utilities

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

// Company extraction logic

function extractCompany() {
  try {
    // Hostname inference (most reliable)

    const host = window.location.hostname.replace("www.", "");
    const brand = host.split(".")[0];

    if (brand && brand.length > 2) {
      return titleCase(brand);
    }

    // Fallback to meta tags

    const meta =
      document.querySelector('meta[property="og:site_name"]') ||
      document.querySelector('meta[name="application-name"]');

    if (meta?.content) return meta.content.trim();

    return null;
  } catch {
    return null;
  }
}

// Role extraction logic

function extractRole() {
  try {
    // Check headings (often the most accurate)

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

    // URL slug fallback

    const path = window.location.pathname;

    // Common ATS patterns
    const slugMatch =
      path.match(/listing\/([^\/]+)/i) ||
      path.match(/jobs\/([^\/]+)/i) ||
      path.match(/positions\/([^\/]+)/i);

    if (slugMatch && slugMatch[1]) {
      return titleCase(slugMatch[1].replace(/-/g, " "));
    }

    // Fallback to document title

    const title = document.title;
    if (title && !isGenericTitle(title)) {
      return title.split("|")[0].trim();
    }

    return null;
  } catch {
    return null;
  }
}

// Stipend and salary extraction logic

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

// Description extraction logic

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

// Main entry point for extraction

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
