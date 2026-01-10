(() => {
  // ===============================
  // Internly – Content Script
  // Phase 2 + Phase 3 (FINAL)
  // ===============================

  console.log("[Internly][Content] Content script loaded");
  console.log("[Internly][Content] Current URL:", window.location.href);

  const url = window.location.href.toLowerCase();
  const host = window.location.hostname.toLowerCase();

  // -------------------------------
  // Block obvious non-job sites
  // -------------------------------
  const BLOCKED_HOSTS = [
    "google.com",
    "youtube.com",
    "twitter.com",
    "facebook.com",
    "instagram.com",
    "reddit.com",
  ];

  if (BLOCKED_HOSTS.some((h) => host.includes(h))) {
    console.log("[Internly][Detection] Confidence: 5 → Low (blocked host)");
    return;
  }

  // -------------------------------
  // Phase 2 – Detection (UNCHANGED)
  // -------------------------------
  function detectApplicationPage() {
    let confidence = 0;

    if (url.includes("jobs")) confidence += 25;
    if (url.includes("career")) confidence += 20;
    if (url.includes("apply")) confidence += 40;

    const forms = document.querySelectorAll("form");
    if (forms.length > 0 && forms.length <= 4) confidence += 20;

    if (document.querySelectorAll('input[type="file"]').length > 0)
      confidence += 35;

    const buttons = [...document.querySelectorAll("button, a")];
    if (buttons.some((b) => b.innerText.toLowerCase().includes("apply")))
      confidence += 20;

    const text = document.body.innerText.toLowerCase();
    if (
      text.includes("job description") ||
      text.includes("responsibilities") ||
      text.includes("qualifications") ||
      text.includes("internship")
    ) {
      confidence += 15;
    }

    if (
      host.includes("linkedin.com") &&
      document.querySelector('[role="dialog"]') &&
      text.includes("easy apply")
    ) {
      return 85;
    }

    return Math.min(confidence, 100);
  }

  // -------------------------------
  // Phase 3 – Extraction (SINGLE SOURCE OF TRUTH)
  // -------------------------------
  function safeText(el, maxLen = 300) {
    try {
      if (!el || !el.innerText) return null;
      return el.innerText.trim().slice(0, maxLen);
    } catch {
      return null;
    }
  }

  function titleCase(text) {
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function computeFollowUpDate(days = 7) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function extractCompany() {
    try {
      const host = window.location.hostname.replace("www.", "");
      const brand = host.split(".")[0];
      return brand ? titleCase(brand) : null;
    } catch {
      return null;
    }
  }

  function extractRole() {
    try {
      // 1️⃣ URL slug (PRIMARY – Stripe / Greenhouse)
      const path = window.location.pathname;
      const match =
        path.match(/listing\/([^\/]+)/i) ||
        path.match(/jobs\/([^\/]+)/i) ||
        path.match(/positions\/([^\/]+)/i);

      if (match && match[1]) {
        return titleCase(match[1].replace(/-/g, " "));
      }

      // 2️⃣ Headings fallback
      const headings = document.querySelectorAll("h1, h2, h3");
      for (const h of headings) {
        const text = safeText(h, 200);
        if (text && text.length > 10 && text.toLowerCase() !== "jobs") {
          return text;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  function extractStipend() {
    try {
      const text = document.body.innerText.toLowerCase();
      const match = text.match(
        /(stipend|salary|ctc|pay)[^\d]{0,20}(\₹|\$)?\s?\d+/i
      );
      return match ? match[0] : null;
    } catch {
      return null;
    }
  }

  function extractDescription() {
    try {
      const keywords = [
        "job description",
        "responsibilities",
        "requirements",
        "qualifications",
      ];

      const blocks = document.querySelectorAll("section, article, div");
      for (const el of blocks) {
        const text = el.innerText;
        if (!text || text.length < 120) continue;
        if (keywords.some((k) => text.toLowerCase().includes(k))) {
          return text.trim().slice(0, 2000);
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  function extractApplicationData() {
    return {
      company: extractCompany(),
      role: extractRole(),
      stipend: extractStipend(),
      description: extractDescription(),
      applicationUrl: window.location.href,
      appliedAt: new Date().toISOString(),
      followUpAt: computeFollowUpDate(7),
    };
  }

  // -------------------------------
  // Runner
  // -------------------------------
  let lastConfidence = -1;

  function runDetection() {
    const confidence = detectApplicationPage();

    if (confidence !== lastConfidence) {
      const level =
        confidence >= 60 ? "High" : confidence >= 30 ? "Medium" : "Low";

      console.log(
        `[Internly][Detection] Confidence: ${confidence} → ${level}`
      );

      if (confidence >= 60) {
        console.log(
          "[Internly][Extracted Application]",
          extractApplicationData()
        );
      }

      lastConfidence = confidence;
    }
  }

  runDetection();
  setTimeout(runDetection, 1500);
  setTimeout(runDetection, 3000);

  const observer = new MutationObserver(() => {
    clearTimeout(observer._t);
    observer._t = setTimeout(runDetection, 600);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
