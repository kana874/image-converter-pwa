---
status: verified
reviewed_source: repository-branch
last_checked: 2026-09-09
---

# Known issues and constraints

## 文書・構成上の既知事項

- PWA版は`1.2.0`、Service Workerキャッシュキーは`image-converter-pwa-v1.2.0`、変換エンジン系統は`v11`です。
- アプリ本体は `.txt` の6断片を実行時に結合し、`jxl-extension.txt`を`startup()`直前へ挿入して評価します。構文検査ではこの挿入後ソースも確認する必要があります。
- HEIC / HEIFデコーダは固定CDNへ依存し、初回取得前の完全オフライン環境では利用できません。
- JXLコーデックも固定CDNの`@jsquash/jxl 1.3.0`へ依存します。Service Workerでキャッシュしますが、初回取得には通信が必要です。

## JXLの境界

- JXL変換はCanvas / ImageDataを中間表現とするため、アニメーション、HDR / 高ビット深度、元JXLのメタデータや特殊な符号化特性は保持しません。
- 「JXLロスレス」は変換後のRGBA画素に対する可逆圧縮です。元ファイルのコンテナ情報やメタデータまで完全に可逆ではありません。
- JXLをネイティブ表示できないブラウザでは、保存した`.jxl`をブラウザ単体で直接表示できない場合があります。アプリ内プレビューはJPEGへ変換して表示します。

## 製品上の境界

- ブラウザが対応しない入力形式やWeb APIは利用できず、利用可能な機能へ縮退します。
- ZIPはStore方式で生成し、ZIP64には対応していません。
- 大量または大容量画像の変換とZIP作成は、端末メモリを多く使用する可能性があります。
- JXLはWASMエンコード/デコードを行うため、JPEG / WebPより処理時間やメモリ使用量が増える場合があります。

## 未検証項目

- HEIC / HEIF / JXLを含む実画像変換、iOS / Androidのインストール、キャッシュ後のオフライン再起動は自動テスト対象外です。
- JXLについてはJPEG→JXL、HEIC→JXL、JXL→JPEG、JXL→JXL、ロスレス、透明画像、目標容量調整を実ブラウザで受入確認する必要があります。
