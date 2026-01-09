/**
 * Data Scrapers for each platform
 * Extracts job details from DOM elements
 */

import { Platform, ApplicationData } from './detectors';

/**
 * LinkedIn scraper
 */
export function scrapeLinkedIn(): Partial<ApplicationData> {
  // Company name
  const companySelectors = [
    '.jobs-unified-top-card__company-name',
    '.jobs-details-top-card__company-name',
    '[data-test-id="job-poster"]',
    '.job-details-jobs-unified-top-card__company-name'
  ];
  
  let company = '';
  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      company = element.textContent?.trim() || '';
      if (company) break;
    }
  }

  // Job title/role
  const roleSelectors = [
    '.jobs-unified-top-card__job-title',
    '.jobs-details-top-card__job-title',
    'h1[data-test-id="job-title"]',
    '.job-details-jobs-unified-top-card__job-title'
  ];
  
  let role = '';
  for (const selector of roleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      role = element.textContent?.trim() || '';
      if (role) break;
    }
  }

  // Location
  const locationSelectors = [
    '.jobs-unified-top-card__bullet',
    '.jobs-details-top-card__bullet',
    '[data-test-id="job-location"]',
    '.job-details-jobs-unified-top-card__primary-description-without-tagline'
  ];
  
  let location = '';
  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim() || '';
      // Filter out non-location text
      if (text && !text.includes('·') && text.length < 100) {
        location = text;
        break;
      }
    }
  }

  // Determine if remote/on-site
  const pageText = document.body.innerText.toLowerCase();
  let mode: 'remote' | 'on-site' | 'hybrid' | undefined;
  if (pageText.includes('remote') || pageText.includes('work from home')) {
    mode = 'remote';
  } else if (pageText.includes('hybrid')) {
    mode = 'hybrid';
  } else if (location) {
    mode = 'on-site';
  }

  return {
    company,
    role,
    location: location || undefined,
    mode,
    jobUrl: window.location.href
  };
}

/**
 * Internshala scraper
 */
export function scrapeInternshala(): Partial<ApplicationData> {
  // Company name
  const companySelectors = [
    '.company_name',
    '.internship_meta .company_name',
    '[itemprop="name"]',
    '.detail-heading + .detail-text'
  ];
  
  let company = '';
  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      company = element.textContent?.trim() || '';
      if (company) break;
    }
  }

  // Job title
  const roleSelectors = [
    '.internship_meta h1',
    '.detail-heading',
    'h1[itemprop="title"]',
    '.internship-title'
  ];
  
  let role = '';
  for (const selector of roleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      role = element.textContent?.trim() || '';
      if (role) break;
    }
  }

  // Location
  const locationSelectors = [
    '.location_link',
    '[itemprop="jobLocation"]',
    '.internship_meta .location',
    '.detail-text:contains("Location")'
  ];
  
  let location = '';
  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      location = element.textContent?.trim() || '';
      if (location) break;
    }
  }

  return {
    company,
    role,
    location: location || undefined,
    jobUrl: window.location.href
  };
}

/**
 * Greenhouse scraper
 */
export function scrapeGreenhouse(): Partial<ApplicationData> {
  // Company name - usually in page title or header
  const companySelectors = [
    '.company-name',
    '.app-header__company-name',
    'h1 .company',
    '[data-testid="company-name"]'
  ];
  
  let company = '';
  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      company = element.textContent?.trim() || '';
      if (company) break;
    }
  }

  // If not found, try extracting from page title
  if (!company) {
    const title = document.title;
    const match = title.match(/(.+?)\s*-\s*Jobs/i);
    if (match) company = match[1].trim();
  }

  // Job title
  const roleSelectors = [
    '.app-title',
    'h1[data-testid="job-title"]',
    '.job-title',
    'h1'
  ];
  
  let role = '';
  for (const selector of roleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim() || '';
      // Skip if it's the company name
      if (text && text !== company && text.length < 200) {
        role = text;
        break;
      }
    }
  }

  // Location
  const locationSelectors = [
    '.location',
    '[data-testid="job-location"]',
    '.job-location'
  ];
  
  let location = '';
  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      location = element.textContent?.trim() || '';
      if (location) break;
    }
  }

  return {
    company,
    role,
    location: location || undefined,
    jobUrl: window.location.href
  };
}

/**
 * Lever scraper
 */
export function scrapeLever(): Partial<ApplicationData> {
  // Company name
  const companySelectors = [
    '.main-header-logo',
    '.company-name',
    'h1 .company',
    '[data-lever="company-name"]'
  ];
  
  let company = '';
  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      company = element.textContent?.trim() || '';
      if (company) break;
    }
  }

  // Job title
  const roleSelectors = [
    '.posting-headline h2',
    'h2.posting-title',
    '[data-lever="job-title"]',
    'h2'
  ];
  
  let role = '';
  for (const selector of roleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      role = element.textContent?.trim() || '';
      if (role) break;
    }
  }

  // Location
  const locationSelectors = [
    '.posting-categories',
    '.location',
    '[data-lever="location"]'
  ];
  
  let location = '';
  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      location = element.textContent?.trim() || '';
      if (location) break;
    }
  }

  return {
    company,
    role,
    location: location || undefined,
    jobUrl: window.location.href
  };
}

/**
 * Workday scraper
 */
export function scrapeWorkday(): Partial<ApplicationData> {
  // Company name - usually in URL or page title
  const companySelectors = [
    '[data-automation-id="jobPostingHeader"] .company-name',
    '.company-name',
    'h1 .company'
  ];
  
  let company = '';
  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      company = element.textContent?.trim() || '';
      if (company) break;
    }
  }

  // Extract from URL if not found
  if (!company) {
    const urlMatch = window.location.href.match(/\/jobs\/[^/]+\/([^/]+)/);
    if (urlMatch) {
      company = decodeURIComponent(urlMatch[1]).replace(/-/g, ' ');
    }
  }

  // Job title
  const roleSelectors = [
    '[data-automation-id="jobPostingHeader"] h2',
    'h2[data-automation-id="jobPostingHeader"]',
    '.job-title',
    'h2'
  ];
  
  let role = '';
  for (const selector of roleSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      role = element.textContent?.trim() || '';
      if (role) break;
    }
  }

  // Location
  const locationSelectors = [
    '[data-automation-id="jobPostingHeader"] .location',
    '.job-location',
    '[data-automation-id="locations"]'
  ];
  
  let location = '';
  for (const selector of locationSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      location = element.textContent?.trim() || '';
      if (location) break;
    }
  }

  return {
    company,
    role,
    location: location || undefined,
    jobUrl: window.location.href
  };
}

/**
 * Main scraper function - routes to platform-specific scraper
 */
export function scrapeJobData(platform: Platform): Partial<ApplicationData> {
  switch (platform) {
    case 'linkedin':
      return scrapeLinkedIn();
    case 'internshala':
      return scrapeInternshala();
    case 'greenhouse':
      return scrapeGreenhouse();
    case 'lever':
      return scrapeLever();
    case 'workday':
      return scrapeWorkday();
    default:
      // Generic fallback scraper
      return {
        company: document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || 
                 document.title.split(' - ')[0] || '',
        role: document.querySelector('h1')?.textContent?.trim() || '',
        jobUrl: window.location.href
      };
  }
}

/**
 * Validates scraped data
 */
export function validateScrapedData(data: Partial<ApplicationData>): boolean {
  return !!(data.company && data.role && data.jobUrl);
}

