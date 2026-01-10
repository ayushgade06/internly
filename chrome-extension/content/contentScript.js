(() => {
  // ===============================
  // Internly – Content Script
  // Phase 2: Application Page Detection
  // ===============================

  console.log("[Internly][Content] Content script loaded");
  console.log("[Internly][Content] Current URL:", window.location.href);

  const url = window.location.href.toLowerCase();
  const host = window.location.hostname.toLowerCase();

  // -------------------------------
  // 1️⃣ Hard-block obvious non-job sites
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
  // 2️⃣ Detection engine
  // -------------------------------
  function detectApplicationPage() {
    let confidence = 0;

    // -------------------------------
    // URL heuristics
    // -------------------------------
    if (url.includes("jobs")) confidence += 25;
    if (url.includes("career")) confidence += 20;
    if (url.includes("apply")) confidence += 40;

    // -------------------------------
    // DOM heuristics
    // -------------------------------
    const forms = document.querySelectorAll("form");
    if (forms.length > 0 && forms.length <= 4) confidence += 20;

    const fileInputs = document.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) confidence += 35;

    const buttons = [...document.querySelectorAll("button, a")];
    if (
      buttons.some((b) =>
        b.innerText.toLowerCase().includes("apply")
      )
    ) {
      confidence += 20;
    }

    // -------------------------------
    // Text heuristics
    // -------------------------------
    const text = document.body.innerText.toLowerCase();

    if (
      text.includes("job description") ||
      text.includes("responsibilities") ||
      text.includes("qualifications") ||
      text.includes("internship")
    ) {
      confidence += 15;
    }

    // -------------------------------
    // LinkedIn Easy Apply override
    // -------------------------------
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
  // 3️⃣ Detection runner (deduped logs)
  // -------------------------------
  let lastConfidence = -1;

  function runDetection() {
    const confidence = detectApplicationPage();

    if (confidence !== lastConfidence) {
      let level = "Low";
      if (confidence >= 60) level = "High";
      else if (confidence >= 30) level = "Medium";

      console.log(
        `[Internly][Detection] Confidence: ${confidence} → ${level}`
      );

      lastConfidence = confidence;
    }
  }

  console.log("[Internly][Content] Init called");

  // -------------------------------
  // 4️⃣ Initial + delayed runs
  // -------------------------------
  runDetection();
  setTimeout(runDetection, 1500);
  setTimeout(runDetection, 3000);

  // -------------------------------
  // 5️⃣ Debounced MutationObserver
  // -------------------------------
  let debounceTimer = null;

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runDetection, 600);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
