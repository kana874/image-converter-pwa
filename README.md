# 画像変換 PWA

HEIC / HEIF / JPEG XL (JXL) を含む画像をブラウザ内で変換する GitHub Pages / PWA 版です。ベースは `heic_to_jpg_offline_v11.html` です。

## 主な機能

- HEIC / HEIF / JPEG / PNG / WebP / JXL / BMP / GIF / SVG / AVIF / TIFF等の読み込み
- JPEG / PNG / WebP / JXLへの変換
- JXLの通常圧縮（品質1～100）と画素ロスレス出力
- 複数画像の一括処理、ドラッグ＆ドロップ
- 画像ごとの左90° / 右90° / 180°回転、回転リセット
- 品質指定、幅800px / 1700px、任意解像度
- 目標ファイルサイズに合わせた品質・解像度調整
- ファイル名テンプレート、プリセット保存
- EXIF / GPS等メタデータ削除
- 個別保存 / 一括保存 / ZIP保存
- Service WorkerによるPWA・オフライン利用

画像データそのものは外部サーバーへ送信せず、変換はブラウザ内で実行します。HEIC / HEIF デコードには `libheif-js 1.19.8`、JXLのエンコード/デコードには `@jsquash/jxl 1.3.0`（libjxl / WebAssembly）を使用します。どちらもバージョン固定URLから取得し、Service Workerでキャッシュします。

JXL出力はブラウザ標準のCanvasエンコーダーではなくWASMで生成します。そのためChrome / Edge等でJXLを画像として直接表示できない環境でも変換と保存は可能です。アプリ内プレビューはJPEGプレビューを別途生成します。

## JXL対応範囲

- JXL → JPEG / PNG / WebP / JXL
- JPEG / PNG / WebP / HEIC等 → JXL
- JXL通常圧縮（品質指定）
- JXL画素ロスレス圧縮
- 透明度の保持
- リサイズ、回転、目標ファイルサイズ調整
- 一括保存 / ZIP保存

現時点ではアニメーションJXL、HDR / 高ビット深度を保持したままの変換、JXL内EXIF等の完全保持は対象外です。Canvas / ImageDataを中間表現に使用するため、JXLロスレスは「変換後の画素データに対する可逆圧縮」を意味し、元ファイルのメタデータや特殊な符号化特性の完全保存を意味しません。

## 単一HTML・完全オフライン版

インターネットへ一度も接続できない端末へ持ち込む用途向けに、CSS・アプリ本体・HEIC用WASM・JXL用WASMを1個のHTMLファイルへ内蔵した版を生成できます。生成したHTMLはWebサーバーやService Workerを必要とせず、Windows上でファイルを直接ダブルクリックして `file://` から実行できます。

単一HTML版では以下を外部へ取得しません。

- CSS / JavaScript
- `libheif-js` のHEIC / HEIFデコーダー
- `@jsquash/jxl` / libjxlのJXLエンコーダー・デコーダー
- アイコン、manifest、Service Worker

生成手順:

```bash
npm install --no-save --ignore-scripts esbuild@0.25.9 @jsquash/jxl@1.3.0 libheif-js@1.19.8
node scripts/build-standalone.js
node scripts/check-standalone.js
```

出力先:

```text
dist/image-converter-standalone-v1.2.0.html
```

Pull RequestではGitHub Actionsが単一HTMLを自動生成し、Chromiumで `file://` から開いた状態でJXLのエンコード→デコードと外部通信が発生しないことを確認します。生成物は `image-converter-standalone` Artifactとして取得できます。

単一HTML版はPWAとしてインストールするための版ではありません。USBメモリや社内ファイル共有等でHTMLファイルそのものを配布し、完全オフライン端末で直接開く用途を想定しています。

## GitHub Pages

`Settings` → `Pages` → `Deploy from a branch` → `main` / `/ (root)` を指定してください。

公開URL:

```text
https://kana874.github.io/image-converter-pwa/
```

## 依存ライブラリ

- libheif-js 1.19.8 (LGPL-3.0)
- @jsquash/jxl 1.3.0 (Apache-2.0、libjxlベース)
- CDN URLはバージョン固定

## バージョン

- PWA版: 1.2.0
- 単一HTML版: PWA版の同一バージョンから生成
- ベース: HEIC → JPG Offline v11

## AI共有knowledge

- AI向けの正本索引: [`.ai/INDEX.md`](.ai/INDEX.md)
- Gemini Web等の互換読取ページ: [`ai-knowledge/`](ai-knowledge/)
- 機械可読メタデータ: [`ai-knowledge/phase4.json`](ai-knowledge/phase4.json)

`.ai/` を正本とし、公開互換ページとの一致は `npm test` で検査します。
