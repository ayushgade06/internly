type DetectionResult = {
  confidence: number;
  signals: {
    url: number;
    dom: number;
    form: number;
  };
};

export function detectApplicationPage(): DetectionResult {
  let urlScore = 0;
  let domScore = 0;
  let formScore = 0;

  const url = window.location.href.toLowerCase();

  // --- URL Heuristics (30) ---
  const urlKeywords = ["apply", "career", "job", "intern", "position"];
  urlKeywords.forEach((keyword) => {
    if (url.includes(keyword)) urlScore += 6;
  });
  urlScore = Math.min(urlScore, 30);

  // --- DOM Heuristics (50) ---
  const forms = document.querySelectorAll("form");
  if (forms.length > 0) domScore += 20;

  const fileInputs = document.querySelectorAll(
    'input[type="file"]'
  );
  if (fileInputs.length > 0) domScore += 20;

  const submitButtons = document.querySelectorAll(
    'button[type="submit"], input[type="submit"]'
  );
  if (submitButtons.length > 0) domScore += 10;

  domScore = Math.min(domScore, 50);

  // --- Form Signals (20) ---
  const labels = Array.from(document.querySelectorAll("label")).map(
    (l) => l.textContent?.toLowerCase() || ""
  );

  const formKeywords = ["resume", "cv", "cover", "portfolio"];
  formKeywords.forEach((keyword) => {
    if (labels.some((text) => text.includes(keyword))) {
      formScore += 5;
    }
  });

  formScore = Math.min(formScore, 20);

  return {
    confidence: urlScore + domScore + formScore,
    signals: {
      url: urlScore,
      dom: domScore,
      form: formScore
    }
  };
}
