---
status: verified
reviewed_source: repository-main
last_checked: 2026-09-03
---

# Current state

## バージョン表示

- README記載のPWA版: `1.1.0`
- Service Workerキャッシュキー: `image-converter-pwa-v1.1.0`
- UIのベース表示: `完全オフライン版 v11`

UIのベース表示は元HTML系統を示し、PWA版とService Workerキャッシュキーは現在 `1.1.0` で揃えています。

## 実装済み

- HEIC / HEIF / JPEG / PNG / WebP / BMP / GIF / SVG / AVIF / TIFF等の読込
- JPEG / PNG / WebPへの変換
- 複数画像、ドラッグ＆ドロップ、品質・解像度・容量上限指定
- 画像ごとの左90° / 右90° / 180°回転と回転リセット
- ファイル名テンプレートとブラウザ内プリセット保存
- EXIF / GPS等のメタデータ削除と限定的なJPEG EXIF引継ぎ
- 個別保存、一括保存、ZIP保存、対応環境でのクリップボードコピー
- PWA、オフラインキャッシュ、iPhone / iPad向けホーム画面追加案内

## 検証基準

ルートで `npm test` を実行し、ローダー、分割JavaScript、manifest、Service Worker構成、AI knowledgeミラーを検査します。
