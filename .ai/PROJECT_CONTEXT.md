---
status: verified
reviewed_source: repository-main
last_checked: 2026-08-29
---

# Project context

画像変換PWAは、HEIC / HEIFを含む画像をブラウザ内で読み込み、JPEG / PNG / WebPへ変換するGitHub Pages対応PWAです。

## 目的

- 複数画像をブラウザ内で一括変換する。
- 品質、解像度、目標ファイルサイズ、出力名を指定する。
- 個別保存、一括保存、ZIP保存、対応ブラウザではクリップボードコピーを提供する。
- EXIFやGPS等のメタデータを既定で削除する。
- デスクトップとスマートフォンからPWAとして利用できるようにする。

## 境界

- 画像変換はブラウザ内で実行し、画像データ自体を外部サーバーへ送信しません。
- HEIC / HEIFデコード用の `libheif-js 1.19.8` は、初回にjsDelivrから取得してService Workerへキャッシュします。
- ユーザー作成プリセットはブラウザ内へ保存され、リポジトリのHTMLを変更しません。
