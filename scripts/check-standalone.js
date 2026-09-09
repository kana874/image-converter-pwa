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
  'image/jxl',
  'HeifDecoder',
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
if (!/const OFFLINE_EMBEDDED=true;/.test(html)) throw new Error('OFFLINE_EMBEDDED was not enabled.');
if (/navigator\.serviceWorker\.register/.test(html)) throw new Error('PWA bootstrap should not be present in standalone HTML.');

console.log(`PASS: standalone HTML is self-contained (${(size / 1024 / 1024).toFixed(2)} MiB)`);
