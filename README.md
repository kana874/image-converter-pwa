# 画像変換 PWA

`heic_to_jpg_offline_v11.html` をベースに、GitHub Pages / PWA向けに再構成した完全クライアント処理の画像変換ツールです。

## 主な機能

- HEIC / HEIF / JPEG / PNG / WebP / BMP / GIF / SVG / AVIF / TIFF等の読み込み
- JPEG / PNG / WebPへの変換
- 複数画像の一括処理、ドラッグ＆ドロップ
- 品質指定、幅800px / 1700px、任意解像度
- 目標ファイルサイズに合わせた品質・解像度調整
- ファイル名テンプレート、プリセット保存
- EXIF / GPS等メタデータ削除
- 個別保存 / 一括保存 / ZIP保存
- Service Workerによるオフライン利用

画像の変換処理はブラウザ内で行い、画像ファイルを外部サーバーへ送信しません。

## 構成

```text
index.html
css/app.css
js/app.js
vendor/heic-offline-engine.js
icons/icon-192.png
icons/icon-512.png
manifest.json
service-worker.js
.nojekyll
```

## GitHub Pages

推奨公開方法は、GitHub Pagesの **Deploy from a branch** で `main` / `/ (root)` を指定する方式です。

公開URL例:

```text
https://kana874.github.io/image-converter-pwa/
```

## ローカル確認

Service Workerは `file://` では動作しないため、ローカルHTTPサーバーで確認します。

```bash
python -m http.server 8080
```

その後 `http://localhost:8080/` を開きます。

## バージョン

- PWA版: 1.0.0
- ベース: HEIC → JPG Offline v11
