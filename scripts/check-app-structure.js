'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const partPaths = Array.from({ length: 6 }, (_, index) =>
  `js/app-part-${String(index + 1).padStart(2, '0')}.txt`
);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const index = read('index.html');
const loader = read('js/app-loader.js');
const worker = read('service-worker.js');
const manifest = JSON.parse(read('manifest.json'));

new Function(loader);
new Function(partPaths.map(read).join(''));

for (const partPath of partPaths) {
  const loaderReference = `./${partPath}`;
  if (!loader.includes(loaderReference)) {
    throw new Error(`app-loader.js does not load ${loaderReference}`);
  }
  if (!worker.includes(loaderReference)) {
    throw new Error(`service-worker.js does not cache ${loaderReference}`);
  }
}

for (const required of ['./manifest.json', './js/app-loader.js']) {
  if (!index.includes(required)) throw new Error(`index.html does not reference ${required}`);
}

if (!manifest.name || !manifest.start_url || !Array.isArray(manifest.icons)) {
  throw new Error('manifest.json is missing required application metadata');
}

if (!/const CACHE_NAME\s*=\s*["'][^"']+["']/.test(worker)) {
  throw new Error('service-worker.js is missing a static CACHE_NAME');
}

for (const guard of ['scopeUrl.pathname', 'appIndexUrl.pathname', 'isAppShellNavigation']) {
  if (!worker.includes(guard)) {
    throw new Error(`service-worker.js is missing the app-shell navigation guard: ${guard}`);
  }
}

console.log('PASS: loader, concatenated app, manifest, and service worker structure');
