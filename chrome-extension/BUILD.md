# Build Instructions

## Prerequisites

- Node.js 16+ and npm
- TypeScript 5+

## Installation

```bash
cd chrome-extension
npm install
```

## Building

### Development Build

```bash
npm run build
```

This will:
1. Compile TypeScript files to JavaScript
2. Copy HTML/CSS files to dist folder
3. Update manifest.json paths

### Watch Mode (Development)

```bash
npm run watch
```

This will automatically rebuild when files change.

## Loading in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist` folder

## File Structure After Build

```
dist/
├── manifest.json
├── background/
│   └── background.js
├── content/
│   └── contentScript.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── utils/
    ├── detectors.js
    ├── scrapers.js
    └── storage.js
```

## Icons

Create icon files in the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

Or run:
```bash
node scripts/create-icons.js
```

Then add your icon files to the `icons/` directory.

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors:
1. Check that all dependencies are installed: `npm install`
2. Verify TypeScript version: `npx tsc --version`
3. Check `tsconfig.json` configuration

### Manifest Errors

If Chrome shows manifest errors:
1. Verify `dist/manifest.json` exists
2. Check that all referenced files exist in `dist/`
3. Ensure file paths in manifest are correct

### Extension Not Working

1. Check browser console (F12) for errors
2. Check extension service worker (chrome://extensions/ → Details → Service worker)
3. Verify content script is injected (check page source)
4. Enable debug mode in extension settings

## Production Build

For production:
1. Build: `npm run build`
2. Test thoroughly
3. Create a ZIP of the `dist` folder
4. Submit to Chrome Web Store (if publishing)

## Development Workflow

1. Make changes to TypeScript files
2. Run `npm run build` or `npm run watch`
3. Reload extension in Chrome (chrome://extensions/ → Reload)
4. Test on target platform
5. Check console for errors

## Hot Reload (Manual)

Chrome doesn't support true hot reload for extensions, but you can:
1. Use `npm run watch` to auto-compile
2. Use Chrome's "Reload" button on the extension
3. Refresh the page you're testing on

