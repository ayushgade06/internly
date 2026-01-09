/**
 * Platform Detection & Application Success Detection
 * 
 * Detects when a user successfully applies to a job/internship
 * by monitoring DOM changes, URL patterns, and success indicators
 */

export type Platform = 'linkedin' | 'internshala' | 'greenhouse' | 'lever' | 'workday' | 'unknown';

export interface ApplicationData {
  company: string;
  role: string;
  platform: Platform;
  jobUrl: string;
  appliedAt: string; // ISO timestamp
  location?: string;
  mode?: 'remote' | 'on-site' | 'hybrid';
}

/**
 * Detects which platform the user is on based on URL
 */
export function detectPlatform(): Platform {
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('internshala.com')) return 'internshala';
  if (hostname.includes('greenhouse.io')) return 'greenhouse';
  if (hostname.includes('lever.co')) return 'lever';
  if (hostname.includes('workday.com')) return 'workday';
  
  return 'unknown';
}

/**
 * LinkedIn-specific detection
 * Detects "Application submitted" or similar success messages
 */
export function detectLinkedInApplication(): boolean {
  // Check for success messages
  const successIndicators = [
    'application submitted',
    'your application has been submitted',
    'thanks for applying',
    'application sent',
    'we\'ve received your application'
  ];

  const pageText = document.body.innerText.toLowerCase();
  
  // Check if any success indicator is present
  const hasSuccessMessage = successIndicators.some(indicator => 
    pageText.includes(indicator)
  );

  // Check for specific LinkedIn success elements
  const successElements = [
    '[data-test-id="application-submitted"]',
    '.jobs-s-apply__application-submitted',
    '[aria-label*="application submitted"]',
    '.artdeco-toast-item--success'
  ];

  const hasSuccessElement = successElements.some(selector => {
    const element = document.querySelector(selector);
    return element !== null && element.textContent?.toLowerCase().includes('application');
  });

  // Check URL pattern (LinkedIn redirects after successful application)
  const urlPattern = /\/jobs\/view\/|\/jobs\/collections\/recommended/;
  const isOnJobPage = urlPattern.test(window.location.pathname);

  return hasSuccessMessage || hasSuccessElement;
}

/**
 * Internshala-specific detection
 */
export function detectInternshalaApplication(): boolean {
  const successIndicators = [
    'application submitted successfully',
    'your application has been sent',
    'application sent',
    'thank you for applying'
  ];

  const pageText = document.body.innerText.toLowerCase();
  const hasSuccessMessage = successIndicators.some(indicator => 
    pageText.includes(indicator)
  );

  // Check for Internshala-specific success elements
  const successElements = [
    '.success-message',
    '[class*="success"]',
    '.alert-success'
  ];

  const hasSuccessElement = successElements.some(selector => {
    const element = document.querySelector(selector);
    return element && element.textContent?.toLowerCase().includes('application');
  });

  return hasSuccessMessage || hasSuccessElement;
}

/**
 * Greenhouse-specific detection
 */
export function detectGreenhouseApplication(): boolean {
  const successIndicators = [
    'thank you for applying',
    'application received',
    'your application has been submitted',
    'we\'ve received your application'
  ];

  const pageText = document.body.innerText.toLowerCase();
  const hasSuccessMessage = successIndicators.some(indicator => 
    pageText.includes(indicator)
  );

  // Greenhouse shows a confirmation page
  const confirmationElements = [
    '[data-testid="application-confirmation"]',
    '.application-confirmation',
    'h1:contains("Thank you")',
    '.thank-you-message'
  ];

  const hasConfirmation = confirmationElements.some(selector => {
    try {
      const element = document.querySelector(selector);
      return element !== null;
    } catch {
      return false;
    }
  });

  return hasSuccessMessage || hasConfirmation;
}

/**
 * Lever-specific detection
 */
export function detectLeverApplication(): boolean {
  const successIndicators = [
    'thank you for applying',
    'application submitted',
    'we\'ve received your application'
  ];

  const pageText = document.body.innerText.toLowerCase();
  const hasSuccessMessage = successIndicators.some(indicator => 
    pageText.includes(indicator)
  );

  // Lever confirmation page
  const confirmationSelectors = [
    '.post-apply',
    '[data-lever="post-apply"]',
    '.application-confirmation'
  ];

  const hasConfirmation = confirmationSelectors.some(selector => {
    const element = document.querySelector(selector);
    return element !== null;
  });

  return hasSuccessMessage || hasConfirmation;
}

/**
 * Workday-specific detection
 */
export function detectWorkdayApplication(): boolean {
  const successIndicators = [
    'application submitted',
    'thank you for your interest',
    'your application has been received',
    'confirmation number'
  ];

  const pageText = document.body.innerText.toLowerCase();
  const hasSuccessMessage = successIndicators.some(indicator => 
    pageText.includes(indicator)
  );

  // Workday shows confirmation with specific elements
  const confirmationSelectors = [
    '[data-automation-id="confirmationPage"]',
    '.confirmation-page',
    '[aria-label*="confirmation"]'
  ];

  const hasConfirmation = confirmationSelectors.some(selector => {
    const element = document.querySelector(selector);
    return element !== null;
  });

  return hasSuccessMessage || hasConfirmation;
}

/**
 * Main detection function - determines if application was successful
 */
export function detectApplicationSuccess(platform: Platform): boolean {
  switch (platform) {
    case 'linkedin':
      return detectLinkedInApplication();
    case 'internshala':
      return detectInternshalaApplication();
    case 'greenhouse':
      return detectGreenhouseApplication();
    case 'lever':
      return detectLeverApplication();
    case 'workday':
      return detectWorkdayApplication();
    default:
      return false;
  }
}

/**
 * Monitors button clicks that might indicate application submission
 */
export function setupButtonClickMonitor(callback: () => void): () => void {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const buttonText = target.innerText?.toLowerCase() || '';
    const ariaLabel = target.getAttribute('aria-label')?.toLowerCase() || '';
    const buttonId = target.id?.toLowerCase() || '';
    const buttonClass = target.className?.toLowerCase() || '';

    // Keywords that indicate application submission
    const submitKeywords = [
      'submit application',
      'apply',
      'send application',
      'submit',
      'easy apply',
      'apply now',
      'continue'
    ];

    const isSubmitButton = submitKeywords.some(keyword => 
      buttonText.includes(keyword) ||
      ariaLabel.includes(keyword) ||
      buttonId.includes(keyword) ||
      buttonClass.includes(keyword)
    );

    if (isSubmitButton) {
      // Wait a bit for the page to update after click
      setTimeout(() => {
        callback();
      }, 2000); // 2 second delay to allow page to update
    }
  };

  document.addEventListener('click', handleClick, true);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleClick, true);
  };
}

