# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、GitHub の差分ページでコードをクリップボードにコピーできるようにするブラウザー拡張機能です。WXT フレームワーク (https://wxt.dev/knowledge/index.json) を使用して開発されています。

### 主な機能

- **差分コピー**: GitHub の PR やコミットページで、差分を任意のマークアップ形式でコピー
- **テンプレート管理**: カスタマイズ可能なマークアップテンプレートによる出力形式の制御
- **インポート/エクスポート**: テンプレートの共有と管理

## 開発コマンド

### 開発

```bash
npm run dev           # Chrome で開発サーバーを起動
npm run dev:firefox   # Firefox で開発サーバーを起動
```

### ビルド

```bash
npm run build         # Chrome 向けビルド
npm run build:firefox # Firefox 向けビルド
```

### 配布用 ZIP 作成

```bash
npm run zip           # Chrome 向け ZIP
npm run zip:firefox   # Firefox 向け ZIP
```

### コード品質

```bash
npm run compile      # TypeScript 型チェック
npm run lint         # ESLint でコードをチェック
npm run lint:fix     # ESLint でコードを自動修正
npm run format       # Prettier でコードフォーマットチェック
npm run format:fix   # Prettier でコードを自動フォーマット
```

### テスト

```bash
npm test           # ユニットテストの実行
npm run test:watch # ウォッチモードでユニットテスト
npm run test:e2e   # E2E テストの実行
npm run test:e2e:ui # E2E テストを UI モードで実行
npm run test:all   # ユニットテストと E2E テストを全て実行
```

## アーキテクチャ

### コア構造

- **WXT フレームワーク**: ブラウザー拡張機能開発のための最新フレームワーク
- **React 19 + TypeScript**: UI コンポーネントの実装
- **@primer/react**: GitHub のデザインシステムを使用

### 主要コンポーネント

1. **コンテンツスクリプト** (`entrypoints/github.content/`)
   - GitHub の差分ページを検出して UI を注入
   - Shadow DOM を使用してスタイルの分離を実現
   - 対応パス:
     - `/{owner}/{repo}/commit/{commit_sha}`
     - `/{owner}/{repo}/pull/{pull_number}/files`
     - `/{owner}/{repo}/pull/{pull_number}/commits/{commit_sha}`
   - Handlebars テンプレートエンジンでマークアップ生成

2. **バックグラウンドスクリプト** (`entrypoints/background/`)
   - diff データの取得を担当
   - コンテンツスクリプトとのメッセージング処理
   - IndexedDB を使用したテンプレート・設定の永続化

3. **ポップアップ** (`entrypoints/popup/`)
   - テンプレート管理 UI
   - React + Primer でモダンな UI を実装
   - テンプレートのインポート/エクスポート機能

4. **メッセージング** (`@webext-core/messaging`)
   - コンテンツスクリプトとバックグラウンド間の型安全な通信

5. **データ層** (`utils/`)
   - **Repository 層**: IndexedDB との直接的なやり取り
     - `templatesRepo.ts`: テンプレートの CRUD 操作
     - `settingsRepo.ts`: 設定（デフォルトテンプレート ID など）の管理
   - **Service 層**: ビジネスロジックの実装
     - `templatesService.ts`: テンプレート管理のビジネスロジック
     - `settingsService.ts`: 設定管理のビジネスロジック
   - **Proxy Service**: バックグラウンドとポップアップ間のサービス共有
     - `@webext-core/proxy-service` を使用した RPC パターン

### 処理フロー

1. コンテンツスクリプトが GitHub の差分ページを検出
2. バックグラウンドスクリプトに diff データの取得を依頼
3. 取得した diff を解析し、各ファイルにコピーボタンを追加
4. ボタンクリックで選択したテンプレートに基づいてフォーマットされた diff をクリップボードにコピー

## 重要な実装詳細

### UI レンダリング

- **Shadow DOM**: GitHub のスタイルとの競合を避けるため、UI は Shadow DOM 内にレンダリング
- **styled-components**: Shadow DOM 内でのスタイル適用に StyleSheetManager を使用
- **動的 URL マッチング**: SPA のナビゲーションに対応するため、`wxt:locationchange` イベントを監視
- **テーマ対応**: GitHub のテーマ設定（ライト/ダーク/自動）に追従

### テンプレートエンジン

- **Handlebars**: カスタマイズ可能なマークアップ出力
- デフォルトテンプレート設定
- 複数テンプレートの管理
- JSON 形式でのインポート/エクスポート
- テンプレート変数:
  - `{{#each hunkList}}`: 差分のハンクリスト
  - `{{filePath}}`, `{{fileName}}`: ファイル情報
  - `{{langId}}`: 言語識別子（diff-js, diff-ts など）
  - `{{code}}`: 差分コード
  - ヘルパー関数: `trimWhitespace`, `collapseWhitespace`

### データ管理

- **IndexedDB (idb)**: テンプレートと設定の永続化
- **@webext-core/proxy-service**: バックグラウンドとポップアップ間でのサービス共有
- **型安全性**: TypeScript による完全な型定義

### コピー機能

- **Copy markup**: 差分を Handlebars テンプレートでフォーマットしてコピー
- **Copy raw content**: コミットページでファイルの生コンテンツをコピー（PR ページでは非表示）

## UI フレームワーク

- **React 19**: 最新の React を使用
- **@primer/react**: GitHub のデザインシステムによる UI コンポーネント
- **@primer/octicons-react**: GitHub のアイコンセット

## テスト

### ユニットテスト

- **Vitest**: 高速な単体テスト実行
- `tests/unit/` ディレクトリにテストファイルを配置
- 主要なテスト:
  - `diff.test.ts`: diff 処理のテスト
  - `markup.test.ts`: テンプレートレンダリングのテスト

### E2E テスト

- **Playwright**: ブラウザ拡張機能の E2E テスト
- `tests/e2e/` ディレクトリにテストファイルを配置
- 主要なテスト:
  - `basic.spec.ts`: 基本機能のテスト
  - `popup.spec.ts`: ポップアップ UI のテスト

## 型定義

- WXT により自動生成される型定義ファイル (`.wxt/types/`)
- グローバル型定義:
  - `Template`: テンプレートの型定義
  - `Settings`: 設定の型定義
  - `TemplatesRepo`, `SettingsRepo`: リポジトリインターフェース
  - `TemplatesService`, `SettingsService`: サービスインターフェース

## Tips

- 以下のファイルは[自動インポート](https://wxt.dev/guide/essentials/config/auto-imports)の対象です。明示的なインポートは不要です。
  - `<srcDir>/components/*`
  - `<srcDir>/composables/*`
  - `<srcDir>/hooks/*`
  - `<srcDir>/utils/*`
  - React の主要な Hooks (`useState`, `useEffect` など)
  - WXT のユーティリティ関数 (`defineContentScript`, `defineBackground` など)

- **新しい依存関係の追加**: 必ず `package.json` を確認し、既存のライブラリを優先的に使用すること

## 実装の注意点

- 必要以上の柔軟性を持たせないこと
- YAGNI (You Aren't Gonna Need It) の原則に従うこと
- GitHub のテーマ設定に追従し、ダーク/ライトモードに対応すること
- Shadow DOM を使用して GitHub のスタイルと競合しないようにすること
