# 開発環境セットアップガイド

## Dev Container使用（推奨）

### 前提条件
- Visual Studio Code
- Dev Containers拡張機能
- Docker Desktop

### セットアップ手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/s-hiraoku/ccusage-resident-monitor.git
   cd ccusage-resident-monitor
   ```

2. **VS CodeでDev Containerを開く**
   - VS Codeでフォルダを開く
   - コマンドパレット（Cmd+Shift+P）で「Dev Containers: Reopen in Container」を実行
   - 初回は自動でコンテナがビルドされます

3. **開発環境の確認**
   ```bash
   swift --version
   ccusage --version
   ```

### 開発コマンド

#### ビルド
```bash
swift build
```

#### テスト実行
```bash
swift test
```

#### ccusageテスト
```bash
ccusage daily --json
```

#### デバッグ実行
- VS Codeのデバッグパネルから「Debug CCUsageMonitor」を選択
- F5キーでデバッグ開始

## ローカル開発（macOS）

### 前提条件
- macOS 13.0以降
- Xcode 15.0以降
- ccusage CLI tool

### セットアップ

1. **ccusageインストール**
   ```bash
   npm install -g ccusage
   ```

2. **Xcodeでビルド**
   ```bash
   open CCUsageMonitor.xcodeproj
   ```

3. **Swift Package Managerでビルド**
   ```bash
   swift build
   swift run CCUsageMonitor
   ```

## プロジェクト構造

```
CCUsageMonitor/
├── .devcontainer/          # Dev Container設定
├── .vscode/               # VS Code設定
├── Sources/               # Swiftソースコード
│   └── CCUsageMonitor/
│       ├── main.swift     # アプリケーションエントリポイント
│       ├── ContentView.swift      # UI実装
│       ├── UsageMonitor.swift     # 監視ロジック
│       └── CCUsageService.swift   # ccusage連携
├── CCUsageMonitor.xcodeproj/  # Xcodeプロジェクト
├── Package.swift          # Swift Package Manager設定
└── README.md
```

## 開発タスク

### VS Codeタスク
- `Cmd+Shift+P` → 「Tasks: Run Task」
- 利用可能なタスク：
  - `swift-build`: プロジェクトビルド
  - `swift-test`: テスト実行
  - `ccusage-test`: ccusageコマンドテスト

### デバッグ
- ブレークポイント設定可能
- 変数の監視
- ステップ実行

## トラブルシューティング

### ccusageが見つからない
```bash
npm install -g ccusage
which ccusage
```

### Swift環境の問題
```bash
swift --version
# Swiftが正しくインストールされているか確認
```

### コンテナの再構築
- VS Codeコマンドパレット → 「Dev Containers: Rebuild Container」