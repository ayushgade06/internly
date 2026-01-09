/**
 * Update manifest.json to point to compiled JS files
 */
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'dist', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update paths to compiled JS files
manifest.background.service_worker = 'background/background.js';
manifest.content_scripts[0].js = ['content/contentScript.js'];
manifest.action.default_popup = 'popup/popup.html';

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Manifest updated!');

