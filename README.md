# CCUsage Electron Monitor

macOSのメニューバーに常駐するClaude Code使用量監視ツール（TypeScript/Electron版）

## 概要

ccusage CLIツールを使用してClaude Codeの使用量をリアルタイムで監視し、メニューバーに表示するElectronアプリケーションです。フロントエンドエンジニア向けにTypeScript + React + Electronで構築されています。

## 機能

- ✅ **メニューバー常駐**: システムトレイからアクセス可能
- ✅ **リアルタイム監視**: 30秒間隔での自動更新
- ✅ **使用量表示**: トークン数、コスト、進捗率を表示
- ✅ **視覚的インジケーター**: 使用量に応じたカラーコーディング
- ✅ **エラーハンドリング**: 詳細なエラー表示と復旧機能
- ✅ **TypeScript**: 型安全な開発環境

## 技術スタック

### Core
- **Electron**: デスクトップアプリケーションフレームワーク
- **TypeScript**: 型安全なJavaScript
- **React**: ユーザーインターフェース
- **Zustand**: 軽量状態管理

### Styling & Build
- **Tailwind CSS**: ユーティリティファーストCSS
- **Webpack**: モジュールバンドラー
- **PostCSS**: CSS処理ツール

### Development Tools
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター

## 前提条件

- **Node.js** 18.0以降
- **macOS** 13.0以降
- **ccusage CLI** ツール

```bash
# ccusage CLIのインストール
npm install -g ccusage
```

## インストール・開発

### 1. 依存関係のインストール

```bash
cd ccusage-electron-monitor
npm install
```

### 2. 開発環境での実行

```bash
# 開発サーバーを起動（メインプロセス + レンダラープロセス）
npm run dev

# または個別に実行
npm run dev:renderer  # React開発サーバー（localhost:3000）
npm run dev:main      # Electronメインプロセス
```

### 3. ビルド

```bash
# 本番ビルド
npm run build

# 配布用パッケージ作成
npm run dist

# 配布用ディレクトリ作成（DMGなし）
npm run pack
```

### 4. 開発ツール

```bash
# 型チェック
npm run type-check

# リンター実行
npm run lint

# リンター自動修正
npm run lint:fix
```

## プロジェクト構造

```
ccusage-electron-monitor/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts            # アプリケーションエントリポイント
│   │   ├── tray.ts             # システムトレイ管理
│   │   └── services/
│   │       └── ccusage.ts      # ccusage CLI統合
│   ├── renderer/               # React Frontend
│   │   ├── index.tsx           # React エントリポイント
│   │   ├── App.tsx             # メインコンポーネント
│   │   ├── components/         # UIコンポーネント
│   │   ├── store/              # Zustand状態管理
│   │   └── styles.css          # Tailwind CSS
│   ├── preload/                # IPC Bridge
│   │   └── index.ts            # 安全なIPC通信
│   └── shared/                 # 共有型定義
│       └── types.ts
├── build/                      # Webpack設定
├── assets/                     # アプリアセット
└── dist/                       # ビルド出力
```

## 使用方法

### アプリの起動
1. メニューバーにチャートアイコンが表示されます
2. アイコンをクリックして使用量ウィンドウを開きます
3. 右クリックでコンテキストメニューが表示されます

### 表示項目
- **Input Tokens**: 入力トークン数
- **Output Tokens**: 出力トークン数  
- **Total Cost**: 総使用料金（$）
- **Daily Progress**: 日次使用率（%）
- **Last Updated**: 最終更新時刻

### カラーコーディング
- 🟢 **緑**: 使用率 75%未満（正常）
- 🟠 **オレンジ**: 使用率 75-90%（注意）
- 🔴 **赤**: 使用率 90%以上（警告）

## アーキテクチャ

### メインプロセス (Electron)
- システムトレイ管理
- ccusage CLIとの統合
- 30秒間隔での監視タイマー
- IPC通信ハンドラー

### レンダラープロセス (React)
- ユーザーインターフェース
- Zustandによる状態管理
- リアルタイムデータ表示

### プロセス間通信 (IPC)
```typescript
// 使用量取得
const usage = await window.electronAPI.fetchUsage();

// 自動更新の監視
window.electronAPI.onUsageUpdate((usage) => {
  // 使用量データを受信
});
```

## カスタマイズ

### 更新間隔の変更
```typescript
// src/main/index.ts
const MONITORING_INTERVAL = 30000; // ミリ秒
```

### 日次予算の変更
```typescript
// src/main/services/ccusage.ts
private calculateUsagePercentage(cost: number): number {
  const dailyBudget = 20.0; // $20/日
  return Math.min((cost / dailyBudget) * 100.0, 100.0);
}
```

## トラブルシューティング

### ccusage コマンドが見つからない
```bash
# インストール確認
which ccusage
npm list -g ccusage

# 再インストール
npm install -g ccusage
```

### Electron が起動しない
```bash
# Node.js バージョン確認
node --version  # 18.0以降が必要

# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

### ビルドエラー
```bash
# TypeScript 型チェック
npm run type-check

# ESLint チェック
npm run lint
```

## 開発者向け情報

### Swift版からの移行ポイント
1. **CCUsageService**: Swiftの`Process`からNode.js`spawn`に移行
2. **状態管理**: SwiftUIの`@Published`からZustandに移行
3. **UI**: SwiftUIからReact + Tailwind CSSに移行
4. **システムトレイ**: `MenuBarExtra`から`Electron.Tray`に移行

### 今後の拡張予定
- [ ] 設定画面の追加
- [ ] 通知機能
- [ ] 使用履歴の永続化
- [ ] 複数アカウント対応
- [ ] Windows/Linux対応

## ライセンス

MIT License

## 作者

フロントエンドエンジニア向けTypeScript実装