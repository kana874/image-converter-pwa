---
status: verified
reviewed_source: repository-main
last_checked: 2026-08-29
---

# Current state

## バージョン表示

- README記載のPWA版: `1.0.0`
- Service Workerキャッシュキー: `image-converter-pwa-v1.0.2`
- UIのベース表示: `完全オフライン版 v11`

役割の異なる表記を単一バージョンへ推測統合せず、現在は上記の分割状態として扱います。

## 実装済み

- HEIC / HEIF / JPEG / PNG / WebP / BMP / GIF / SVG / AVIF / TIFF等の読込
- JPEG / PNG / WebPへの変換
- 複数画像、ドラッグ＆ドロップ、品質・解像度・容量上限指定
- ファイル名テンプレートとブラウザ内プリセット保存
- EXIF / GPS等のメタデータ削除と限定的なJPEG EXIF引継ぎ
- 個別保存、一括保存、ZIP保存、対応環境でのクリップボードコピー
- PWA、オフラインキャッシュ、iPhone / iPad向けホーム画面追加案内

## 検証基準

ルートで `npm test` を実行し、ローダー、分割JavaScript、manifest、Service Worker構成、AI knowledgeミラーを検査します。
