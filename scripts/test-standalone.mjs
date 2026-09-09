import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const standalone = path.join(root, 'dist', `image-converter-standalone-v${pkg.version}.html`);

if (!fs.existsSync(standalone)) throw new Error(`Standalone HTML not found: ${standalone}`);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const externalRequests = [];
  const pageErrors = [];

  page.on('request', request => {
    if (/^https?:/i.test(request.url())) externalRequests.push(request.url());
  });
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(pathToFileURL(standalone).href, { waitUntil: 'load' });
  await page.waitForFunction(() => !!document.querySelector('#outputFormat option[value="image/jxl"]'), null, { timeout: 15000 });

  const smoke = await page.evaluate(async () => {
    const codec = globalThis.__JXL_STANDALONE__;
    if (!codec || typeof codec.encode !== 'function' || typeof codec.decode !== 'function') {
      throw new Error('Standalone JXL codec is not available.');
    }

    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 255, 128
    ]);
    const source = new ImageData(pixels, 2, 2);
    const encoded = await codec.encode(source, { quality: 90, effort: 7, lossless: false });
    const decoded = await codec.decode(encoded);

    return {
      encodedBytes: encoded.byteLength,
      width: decoded.width,
      height: decoded.height,
      outputOptions: [...document.querySelectorAll('#outputFormat option')].map(option => option.value),
      heading: document.querySelector('header h1')?.textContent || '',
      badge: document.getElementById('modeBadge')?.textContent || '',
      engineTitle: document.getElementById('engineTitle')?.textContent || ''
    };
  });

  if (externalRequests.length) throw new Error(`External network request detected: ${externalRequests.join(', ')}`);
  if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join(' | ')}`);
  if (smoke.encodedBytes <= 0 || smoke.width !== 2 || smoke.height !== 2) {
    throw new Error(`JXL round-trip failed: ${JSON.stringify(smoke)}`);
  }
  if (!smoke.outputOptions.includes('image/jxl')) throw new Error('JXL output option was not installed.');
  if (!smoke.badge.includes('単一HTML版')) throw new Error(`Standalone badge missing: ${smoke.badge}`);
  if (!smoke.engineTitle.includes('準備完了')) throw new Error(`HEIC engine did not initialize: ${smoke.engineTitle}`);

  console.log('PASS: file:// standalone page loaded without network access');
  console.log(`PASS: JXL encode/decode smoke test (${smoke.encodedBytes} bytes)`);
} finally {
  await browser.close();
}
