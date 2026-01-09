/**
 * Copy non-TypeScript files to dist directory
 */
const fs = require('fs');
const path = require('path');

const filesToCopy = [
  { from: 'popup/popup.html', to: 'dist/popup/popup.html' },
  { from: 'popup/popup.css', to: 'dist/popup/popup.css' },
  { from: 'manifest.json', to: 'dist/manifest.json' }
];

filesToCopy.forEach(({ from, to }) => {
  const fromPath = path.join(__dirname, '..', from);
  const toPath = path.join(__dirname, '..', to);
  const toDir = path.dirname(toPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true });
  }

  // Copy file
  fs.copyFileSync(fromPath, toPath);
  console.log(`Copied ${from} to ${to}`);
});

console.log('File copy complete!');

