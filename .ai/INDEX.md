# Image Converter PWA knowledge index

この索引は、ChatGPT、Codex、Gemini Web、Antigravity 2が同じプロジェクト情報へ到達するための入口です。

## 正本

- [README](../README.md) — 利用目的、対応形式、機能、依存ライブラリ、公開URL
- [アプリ画面](../index.html) — 現在の入力、変換、保存、設定UI
- [Service Worker](../service-worker.js) — PWAキャッシュ対象とキャッシュキー
- [アプリローダー](../js/app-loader.js) — 分割JavaScriptの読込方式

## 構造化knowledge

- [プロジェクト概要](PROJECT_CONTEXT.md) — `verified`
- [現在の状態](CURRENT_STATE.md) — `verified`
- [実装から確認できる設計上の選択](DECISIONS.md) — `verified`
- [既知事項と未検証項目](KNOWN_ISSUES.md) — `verified`
- [追跡する作業](TASKS.md)
- [AI別アクセス・受入マトリクス](AI_ACCESS_MATRIX.md)

## 候補と引き継ぎ

- [Phase 4導入候補](inbox/knw_20260829_1c0a4e2d-shared-knowledge-rollout.md) — `candidate`
- [引き継ぎの書き方](handoffs/README.md)

## Web AI互換読取

- [非隠しHTML入口](../ai-knowledge/index.html)
- [機械可読JSON](../ai-knowledge/phase4.json)

`.ai/` を取得できないWeb AIでは上記を使用します。HTMLとJSONは `npm test` で候補knowledgeとの一致を検査します。

## 読み方

1. 製品機能と利用方法は `README.md` を優先する。
2. 実装詳細は対象のHTML、JavaScript、Service Workerを確認する。
3. `status: verified` を確認済み情報として扱い、`candidate` と未検証項目は明示する。
4. このPublicリポジトリへprivateな横断knowledgeを複製しない。
