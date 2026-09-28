'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const partPaths = Array.from({ length: 6 }, (_, index) =>
  `js/app-part-${String(index + 1).padStart(2, '0')}.txt`
);
const jxlExtensionPath = 'js/jxl-extension.txt';
const imageToolsExtensionPath = 'js/split-merge-extension.txt';

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const index = read('index.html');
const loader = read('js/app-loader.js');
const worker = read('service-worker.js');
const manifest = JSON.parse(read('manifest.json'));
const extension = read(jxlExtensionPath);
const imageToolsExtension = read(imageToolsExtensionPath);
const baseSource = partPaths.map(read).join('');
const startupMarker = '\nasync function startup(){';

new Function(loader);
new Function(extension);
new Function(imageToolsExtension);
new Function(baseSource);
if (!baseSource.includes(startupMarker)) throw new Error('startup insertion marker is missing from concatenated app');
new Function(baseSource.replace(startupMarker, `\n${extension}\n${imageToolsExtension}\nasync function startup(){`));

for (const partPath of partPaths) {
  const loaderReference = `./${partPath}`;
  if (!loader.includes(loaderReference)) throw new Error(`app-loader.js does not load ${loaderReference}`);
  if (!worker.includes(loaderReference)) throw new Error(`service-worker.js does not cache ${loaderReference}`);
}

for (const requiredPath of [jxlExtensionPath, imageToolsExtensionPath]) {
  const required = `./${requiredPath}`;
  if (!loader.includes(required)) throw new Error(`loader reference is missing: ${required}`);
  if (!worker.includes(required)) throw new Error(`service worker cache reference is missing: ${required}`);
}

for (const required of ['./manifest.json', './js/app-loader.js']) {
  if (!index.includes(required)) throw new Error(`required reference is missing: ${required}`);
}

for (const required of ['@jsquash/jxl@1.3.0', 'image/jxl', 'JXL_MODULE_URL']) {
  if (!extension.includes(required) && !worker.includes(required)) throw new Error(`JXL support marker is missing: ${required}`);
}

for (const required of ['splitImageFiles', 'mergeImageFiles', '画像分割', '画像結合', 'IMAGE_TOOLS_MAX_PIXELS']) {
  if (!imageToolsExtension.includes(required)) throw new Error(`split/merge support marker is missing: ${required}`);
}

if (!manifest.name || !manifest.start_url || !Array.isArray(manifest.icons)) throw new Error('manifest.json is missing required application metadata');
if (!/const CACHE_NAME\s*=\s*["'][^"']+["']/.test(worker)) throw new Error('service-worker.js is missing a static CACHE_NAME');

for (const guard of ['scopeUrl.pathname', 'appIndexUrl.pathname', 'isAppShellNavigation']) {
  if (!worker.includes(guard)) throw new Error(`service-worker.js is missing the app-shell navigation guard: ${guard}`);
}

console.log('PASS: loader, concatenated app + JXL + split/merge extensions, manifest, and service worker structure');
