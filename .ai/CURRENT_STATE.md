---
status: verified
reviewed_source: repository-branch
last_checked: 2026-09-09
---

# Current state

## バージョン表示

- README記載のPWA版: `1.2.0`
- Service Workerキャッシュキー: `image-converter-pwa-v1.2.0`
- UIの変換エンジン系統: `v11`

PWA版と変換エンジン系統は役割が異なるため、単一の番号へ統合しません。

## 実装済み

- HEIC / HEIF / JPEG / PNG / WebP / JXL / BMP / GIF / SVG / AVIF / TIFF等の読込
- JPEG / PNG / WebP / JXLへの変換
- JXLの品質指定による通常圧縮と画素ロスレス出力
- JXL入力をWASMでデコードし、JXL出力をWASMでエンコード
- JXLをネイティブ表示できないブラウザ向けにJPEGプレビューを生成
- 複数画像、ドラッグ＆ドロップ、品質・解像度・容量上限指定
- 画像ごとの左90° / 右90° / 180°回転と回転リセット
- ファイル名テンプレートとブラウザ内プリセット保存
- EXIF / GPS等のメタデータ削除と限定的なJPEG EXIF引継ぎ
- 個別保存、一括保存、ZIP保存、対応環境でのクリップボードコピー
- PWA、オフラインキャッシュ、iPhone / iPad向けホーム画面追加案内

## JXL実装方式

- `@jsquash/jxl 1.3.0` を固定URLから動的importする。
- Service WorkerはJXLモジュールをアプリシェルへ含め、以降のWASM等のGET要求もランタイムキャッシュする。
- 入出力の中間表現はCanvas / ImageDataとする。
- アニメーションJXL、HDR / 高ビット深度保持、JXLメタデータ完全保持は現時点の対象外とする。

## 検証基準

ルートで `npm test` を実行し、ローダー、分割JavaScript、JXL拡張、manifest、Service Worker構成、AI knowledgeミラーを検査します。
