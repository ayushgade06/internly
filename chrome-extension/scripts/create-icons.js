/**
 * Create placeholder icon files (in production, replace with actual icons)
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon as placeholder
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#3b82f6" rx="20"/>
  <text x="64" y="80" font-family="Arial" font-size="60" font-weight="bold" fill="white" text-anchor="middle">IT</text>
</svg>`;

// Note: In production, you'd convert SVG to PNG at different sizes
// For now, we'll create a note file
fs.writeFileSync(
  path.join(iconsDir, 'README.txt'),
  'Place icon files here:\n- icon16.png (16x16)\n- icon48.png (48x48)\n- icon128.png (128x128)\n\nYou can use an online tool to convert SVG to PNG at different sizes.'
);

console.log('Icons directory created. Please add icon files (icon16.png, icon48.png, icon128.png)');

