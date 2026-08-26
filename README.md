# 画像変換 PWA

HEIC / HEIF を含む画像をブラウザ内で変換する GitHub Pages / PWA 版です。ベースは `heic_to_jpg_offline_v11.html` です。

## 主な機能

- HEIC / HEIF / JPEG / PNG / WebP / BMP / GIF / SVG / AVIF / TIFF等の読み込み
- JPEG / PNG / WebPへの変換
- 複数画像の一括処理、ドラッグ＆ドロップ
- 品質指定、幅800px / 1700px、任意解像度
- 目標ファイルサイズに合わせた品質・解像度調整
- ファイル名テンプレート、プリセット保存
- EXIF / GPS等メタデータ削除
- 個別保存 / 一括保存 / ZIP保存
- Service WorkerによるPWA・オフライン利用

画像データそのものは外部サーバーへ送信せず、変換はブラウザ内で実行します。HEIC / HEIF デコードには `libheif-js 1.19.8` のWASM bundleを jsDelivr から初回取得し、Service Workerでキャッシュします。

## GitHub Pages

`Settings` → `Pages` → `Deploy from a branch` → `main` / `/ (root)` を指定してください。

公開URL:

```text
https://kana874.github.io/image-converter-pwa/
```

## 依存ライブラリ

- libheif-js 1.19.8 (LGPL-3.0)
- CDN URLはバージョン固定

## バージョン

- PWA版: 1.0.0
- ベース: HEIC → JPG Offline v11
