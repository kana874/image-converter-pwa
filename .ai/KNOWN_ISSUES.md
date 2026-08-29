---
status: verified
reviewed_source: repository-main
last_checked: 2026-08-29
---

# Known issues and constraints

## 文書・構成上の既知事項

- READMEのPWA版は`1.0.0`、Service Workerキャッシュキーは`1.0.2`、UIのベース表示は`v11`です。
- アプリ本体は `.txt` の6断片を実行時に結合するため、単一ファイルだけの構文検査では不十分です。
- HEIC / HEIFデコーダは固定CDNへ依存し、初回取得前の完全オフライン環境では利用できません。

## 製品上の境界

- ブラウザが対応しない入力形式やWeb APIは利用できず、利用可能な機能へ縮退します。
- ZIPはStore方式で生成し、ZIP64には対応していません。
- 大量または大容量画像の変換とZIP作成は、端末メモリを多く使用する可能性があります。

## 未検証項目

- ChatGPT、Gemini Web、Antigravity 2からの共通knowledge読取は、人間による各画面の受入確認が必要です。
- HEIC / HEIFを含む実画像変換、iOS / Androidのインストール、キャッシュ後のオフライン再起動は自動テスト対象外です。
