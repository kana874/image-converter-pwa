'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const outputName = `image-converter-standalone-v${pkg.version}.html`;
const outputPath = path.join(distDir, outputName);

const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const escapeScript = source => source.replace(/<\/script/gi, '<\\/script');
const escapeStyle = source => source.replace(/<\/style/gi, '<\\/style');

function assertJavaScript(name, source) {
  try {
    new Function(source);
  } catch (error) {
    error.message = `${name}: ${error.message}`;
    throw error;
  }
}

function findPackageRoot(packageName) {
  return path.dirname(require.resolve(`${packageName}/package.json`, { paths: [root] }));
}

function buildJxlEntry(jxlRoot) {
  const encWasm = fs.readFileSync(path.join(jxlRoot, 'codec/enc/jxl_enc.wasm')).toString('base64');
  const decWasm = fs.readFileSync(path.join(jxlRoot, 'codec/dec/jxl_dec.wasm')).toString('base64');

  return `
import encFactory from '@jsquash/jxl/codec/enc/jxl_enc.js';
import decFactory from '@jsquash/jxl/codec/dec/jxl_dec.js';

const ENC_WASM_B64=${JSON.stringify(encWasm)};
const DEC_WASM_B64=${JSON.stringify(decWasm)};
const DEFAULT_OPTIONS={
  effort:7,
  quality:75,
  progressive:false,
  epf:-1,
  lossyPalette:false,
  decodingSpeedTier:0,
  photonNoiseIso:0,
  lossyModular:false,
  lossless:false
};

function base64Bytes(text){
  const binary=atob(text),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes;
}

let encoderPromise=null;
let decoderPromise=null;

function encoder(){
  if(!encoderPromise)encoderPromise=encFactory({noInitialRun:true,wasmBinary:base64Bytes(ENC_WASM_B64)});
  return encoderPromise;
}
function decoder(){
  if(!decoderPromise)decoderPromise=decFactory({noInitialRun:true,wasmBinary:base64Bytes(DEC_WASM_B64)});
  return decoderPromise;
}

async function encode(data,options={}){
  const module=await encoder();
  const resolved={...DEFAULT_OPTIONS,...options};
  if(resolved.lossless){
    resolved.quality=100;
    resolved.lossyModular=false;
    resolved.lossyPalette=false;
  }
  const result=module.encode(data.data,data.width,data.height,resolved);
  if(!result)throw new Error('JPEG XL encoding error.');
  return result.buffer.slice(result.byteOffset,result.byteOffset+result.byteLength);
}

async function decode(buffer){
  const module=await decoder();
  const result=module.decode(buffer);
  if(!result)throw new Error('JPEG XL decoding error.');
  return result;
}

globalThis.__JXL_STANDALONE__={encode,decode};
`;
}

function standaloneJxlExtension(source) {
  let out = source.replace(/^\s*const JXL_MODULE_URL=.*?;\s*\nlet jxlModulePromise=null;\s*\n/m, '\n');
  const getModule = /async function getJxlModule\(\)\{[\s\S]*?\n\}\nfunction installJxlUi/;
  if (!getModule.test(out)) throw new Error('JXL module loader block was not found.');
  out = out.replace(getModule, `async function getJxlModule(){\n const mod=globalThis.__JXL_STANDALONE__;\n if(!(mod&&typeof mod.encode===\"function\"&&typeof mod.decode===\"function\"))throw new AppError(\"E_JXL_ENGINE\",\"単一HTML内のJPEG XL変換エンジンを初期化できませんでした。\");\n return mod;\n}\nfunction installJxlUi`);
  return out;
}

async function main() {
  fs.mkdirSync(distDir, { recursive: true });

  const jxlRoot = findPackageRoot('@jsquash/jxl');
  const libheifRoot = findPackageRoot('libheif-js');
  const libheifBundle = fs.readFileSync(path.join(libheifRoot, 'libheif-wasm/libheif-bundle.js'), 'utf8');

  const jxlBuild = await esbuild.build({
    stdin: {
      contents: buildJxlEntry(jxlRoot),
      resolveDir: root,
      sourcefile: 'standalone-jxl-entry.js'
    },
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    target: ['es2020'],
    minify: true,
    legalComments: 'none',
    logLevel: 'warning'
  });
  const jxlBundle = jxlBuild.outputFiles[0].text;

  const partPaths = Array.from({ length: 6 }, (_, index) =>
    `js/app-part-${String(index + 1).padStart(2, '0')}.txt`
  );
  let appSource = partPaths.map(read).join('');
  appSource = appSource.replace('const OFFLINE_EMBEDDED=false;', 'const OFFLINE_EMBEDDED=true;');

  const extension = standaloneJxlExtension(read('js/jxl-extension.txt'));
  const startupMarker = '\nasync function startup(){';
  if (!appSource.includes(startupMarker)) throw new Error('startup insertion point was not found.');
  appSource = appSource.replace(startupMarker, `\n${extension}\nasync function startup(){`);

  // GitHub Pages / PWA bootstrap is not needed for file:// standalone execution.
  appSource = appSource.replace(/\n\n\/\/ GitHub Pages \/ PWA bootstrap[\s\S]*$/, '\n');

  assertJavaScript('libheif bundle', libheifBundle);
  assertJavaScript('JXL bundle', jxlBundle);
  assertJavaScript('application source', appSource);

  const css = read('css/app.css');
  let html = read('index.html');
  html = html.replace(/<link rel="stylesheet" href="\.\/css\/app\.css">/, `<style>${escapeStyle(css)}</style>`);
  html = html.replace(/\s*<link rel="manifest" href="\.\/manifest\.json">/g, '');
  html = html.replace(/\s*<link rel="apple-touch-icon" href="\.\/icons\/icon-192\.png">/g, '');
  html = html.replace('初回読み込み後はPWAキャッシュによりオフラインでも利用できます。', 'この単一HTML版は変換エンジンを含めてファイル内に内蔵しており、外部通信なしで利用できます。');

  const embeddedScripts = `
<!-- Standalone build: all runtime code and WASM codecs are embedded below. -->
<script>${escapeScript(libheifBundle)}</script>
<script>${escapeScript(jxlBundle)}</script>
<script>${escapeScript(appSource)}</script>
<script>
(() => {
  const STANDALONE_VERSION=${JSON.stringify(pkg.version)};
  const applyStandaloneLabel=()=>{
    const badge=document.getElementById('modeBadge');
    if(badge)badge.textContent='単一HTML版 v'+STANDALONE_VERSION+' / 完全オフライン';
    const sub=document.getElementById('engineSub');
    if(sub&&sub.textContent.includes('ブラウザ内'))sub.textContent+=' 外部ネットワーク接続は使用しません。';
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyStandaloneLabel);
  else applyStandaloneLabel();
})();
</script>`;

  const externalScripts = /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/libheif-js@1\.19\.8\/libheif-wasm\/libheif-bundle\.js"><\/script>\s*<script src="\.\/js\/app-loader\.js"><\/script>/;
  if (!externalScripts.test(html)) throw new Error('Expected external script tags were not found in index.html.');
  html = html.replace(externalScripts, embeddedScripts);

  const notice = `<!--\nStandalone image converter ${pkg.version}\nBundled codecs: libheif-js 1.19.8 (LGPL-3.0), @jsquash/jxl 1.3.0 / libjxl.\nGenerated by scripts/build-standalone.js. No runtime CDN or network dependency is required.\n-->\n`;
  html = html.replace('<!doctype html>', `<!doctype html>\n${notice}`);

  fs.writeFileSync(outputPath, html);
  const mib = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`Built ${path.relative(root, outputPath)} (${mib} MiB)`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
