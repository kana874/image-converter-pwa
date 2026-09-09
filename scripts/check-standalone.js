'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const file = path.join(root, 'dist', `image-converter-standalone-v${pkg.version}.html`);

if (!fs.existsSync(file)) throw new Error(`Standalone HTML not found: ${file}`);
const html = fs.readFileSync(file, 'utf8');
const size = fs.statSync(file).size;

const required = [
  '__JXL_STANDALONE__',
  'HeifDecoder',
  'APP_SOURCE_B64',
  '単一HTML版',
  '完全オフライン'
];
for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Standalone marker missing: ${marker}`);
}

// Generated codec JavaScript can contain HTML-looking strings in its source.
// Check resource-bearing markup only after replacing inline script/style bodies.
const shell = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');

const forbiddenMarkup = [
  /<script\b[^>]*\bsrc\s*=/i,
  /<link\b[^>]*\brel=["'](?:stylesheet|manifest|icon|apple-touch-icon)["'][^>]*\bhref\s*=/i,
  /<(?:img|source|iframe)\b[^>]*\bsrc\s*=\s*["']https?:\/\//i
];
for (const pattern of forbiddenMarkup) {
  if (pattern.test(shell)) throw new Error(`Standalone HTML contains an external resource tag: ${pattern}`);
}

if (/\bJXL_MODULE_URL\b/.test(html)) throw new Error('CDN JXL module loader should not remain in standalone HTML.');
if (size < 1024 * 1024) throw new Error(`Standalone HTML is unexpectedly small: ${size} bytes`);

const appMatch = html.match(/const APP_SOURCE_B64=["']([A-Za-z0-9+/=]+)["'];/);
if (!appMatch) throw new Error('Embedded application Base64 payload was not found.');
const appSource = Buffer.from(appMatch[1], 'base64').toString('utf8');
if (!appSource.includes('const OFFLINE_EMBEDDED=true;')) throw new Error('OFFLINE_EMBEDDED was not enabled in embedded application source.');
if (!appSource.includes('image/jxl')) throw new Error('JXL support is missing from embedded application source.');
if (/navigator\.serviceWorker\.register/.test(appSource)) throw new Error('PWA bootstrap should not be present in standalone application source.');
new Function(appSource);

console.log(`PASS: standalone HTML is self-contained (${(size / 1024 / 1024).toFixed(2)} MiB)`);
