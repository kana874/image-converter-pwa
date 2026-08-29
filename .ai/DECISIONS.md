---
status: verified
reviewed_source: repository-main
last_checked: 2026-08-29
---

# Decisions referenced from the implementation

この文書は既存実装への索引であり、製品ロジックを複製しません。

## 画像処理をブラウザ内で完結させる

入力画像はサーバーへアップロードせず、CanvasとブラウザAPIで変換します。プライバシー境界の正本は [README](../README.md) と [アプリ画面](../index.html) です。

## HEICデコーダはバージョン固定してキャッシュする

`libheif-js 1.19.8` のWASM bundleを固定URLから初回取得し、Service Workerでアプリシェルとともにキャッシュします。詳細は [Service Worker](../service-worker.js) を参照してください。

## アプリ本体を分割して順番に読み込む

`js/app-loader.js` が6個のテキスト断片を順番に取得して結合・評価します。変更時は全断片を結合した構文検査を行い、順序を維持します。

## アプリシェルと文書ナビゲーションを分離する

Service WorkerはPWAルートと `index.html` のナビゲーションだけをアプリシェルとして扱います。`ai-knowledge/` 等の文書ページをアプリ本体のオフラインキャッシュへ誤って保存しないよう、通常URLとして処理します。

## メタデータ削除を既定にする

EXIF・GPS等の削除を既定値とし、無効化時の引継ぎはJPEGからJPEGへの変換に限定します。詳細は [アプリ画面](../index.html) と変換実装を参照してください。
