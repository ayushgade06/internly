# Internship Auto Tracker Chrome Extension

Automatically detects and tracks your internship/job applications across multiple platforms.

## Features

- ✅ **Automatic Detection**: Detects application submissions on LinkedIn, Internshala, Greenhouse, Lever, and Workday
- 🔄 **Auto-Sync**: Automatically syncs detected applications to your backend
- 🚫 **Duplicate Prevention**: Prevents duplicate entries using intelligent hashing
- 💾 **Offline Support**: Stores applications locally and syncs when online
- 🎨 **Clean UI**: Beautiful popup interface to view and manage applications
- ⚙️ **Configurable**: Enable/disable platforms, debug mode, and more

## Supported Platforms

1. **LinkedIn** - Detects "Application submitted" messages and Easy Apply submissions
2. **Internshala** - Monitors application success confirmations
3. **Greenhouse** - Detects Greenhouse application confirmations
4. **Lever** - Tracks Lever application submissions
5. **Workday** - Monitors Workday application confirmations

## Installation

### Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production

1. Build the extension:
```bash
npm run build
```

2. The `dist` folder contains the extension ready to be packaged

## Setup

1. **Connect Extension**:
   - Go to your dashboard at `http://localhost:3000`
   - Click "Connect Chrome Extension"
   - This stores your authentication token

2. **Configure Settings** (Optional):
   - Click the extension icon
   - Click "Settings"
   - Configure enabled platforms, API URL, etc.

## How It Works

### Detection Strategy

The extension uses multiple detection methods:

1. **DOM Monitoring**: Watches for success messages like "Application submitted"
2. **Button Click Tracking**: Monitors clicks on "Apply", "Submit", etc.
3. **URL Pattern Matching**: Detects platform-specific confirmation pages
4. **DOM Mutation Observer**: Watches for dynamic content changes

### Data Extraction

Each platform has specific selectors to extract:
- Company name
- Job title/role
- Location
- Job URL
- Remote/On-site mode (when available)

### Duplicate Prevention

Uses a hash based on:
- Company name (normalized)
- Role/title (normalized)
- Job URL (normalized)

If the same combination exists, it's considered a duplicate.

## Architecture

```
chrome-extension/
├── manifest.json          # Extension manifest (MV3)
├── background/
│   └── background.ts      # Service worker (API sync, deduplication)
├── content/
│   └── contentScript.ts   # DOM monitoring & detection
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Styles
│   └── popup.ts           # Popup controller
└── utils/
    ├── detectors.ts       # Platform detection logic
    ├── scrapers.ts        # Data extraction per platform
    └── storage.ts         # Local storage & deduplication
```

## Extending to New Platforms

To add support for a new platform:

1. **Add Platform Detection** (`utils/detectors.ts`):
```typescript
export function detectNewPlatformApplication(): boolean {
  // Check for success indicators
  const successIndicators = ['application submitted', 'thank you'];
  const pageText = document.body.innerText.toLowerCase();
  return successIndicators.some(indicator => pageText.includes(indicator));
}
```

2. **Add Scraper** (`utils/scrapers.ts`):
```typescript
export function scrapeNewPlatform(): Partial<ApplicationData> {
  return {
    company: document.querySelector('.company-name')?.textContent || '',
    role: document.querySelector('.job-title')?.textContent || '',
    jobUrl: window.location.href
  };
}
```

3. **Update Detectors**:
   - Add platform to `detectPlatform()`
   - Add case in `detectApplicationSuccess()`
   - Add case in `scrapeJobData()`

4. **Update Manifest**:
   - Add host permission for the new platform

## Debugging

Enable debug mode in settings to see detailed logs in the console.

## API Integration

The extension expects a Next.js API at `/api/internships` that:
- Accepts POST requests with Bearer token authentication
- Expects JSON body: `{ company, role, location, url, status }`
- Returns the created internship object

## Troubleshooting

**Applications not being detected:**
- Check if the platform is enabled in settings
- Enable debug mode to see detection logs
- Verify you're on a supported platform

**Sync failing:**
- Check if you're connected (status indicator in popup)
- Verify API URL is correct in settings
- Check browser console for errors

**Duplicates appearing:**
- Clear storage and reconnect
- Check if hash generation is working correctly

## License

MIT

