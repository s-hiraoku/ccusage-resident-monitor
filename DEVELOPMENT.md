# 開発環境セットアップガイド

## 🐳 Dev Container 使用（推奨）

### 前提条件

- **Visual Studio Code** with Dev Containers extension
- **Docker Desktop** (Running)

### 🚀 クイックスタート

1. **リポジトリクローン**

   ```bash
   git clone https://github.com/s-hiraoku/ccusage-resident-monitor.git
   cd ccusage-resident-monitor
   ```

2. **Dev Container 起動**

   - VS Code でフォルダを開く
   - 右下の通知から「Reopen in Container」をクリック
   - または `Cmd+Shift+P` → 「Dev Containers: Reopen in Container」

3. **環境確認**
   ```bash
   swift --version    # Swift 5.10
   ccusage --version  # ccusage CLI
   node --version     # Node.js 20
   ```

### 💻 開発コマンド

| 操作             | コマンド                   | 説明                     |
| ---------------- | -------------------------- | ------------------------ |
| **ビルド**       | `swift build`              | プロジェクトをコンパイル |
| **実行**         | `swift run CCUsageMonitor` | アプリケーション実行     |
| **テスト**       | `swift test`               | 単体テスト実行           |
| **ccusage 確認** | `ccusage daily --json`     | CLI 動作テスト           |

#### 🐛 デバッグ実行

- **VS Code**: F5 キー または デバッグパネル → 「Debug CCUsageMonitor」
- **ターミナル**: `swift build && ./.build/debug/CCUsageMonitor`

## 🍎 ローカル開発（macOS）

### 前提条件

- **macOS 13.0+** (Ventura or later)
- **Xcode 15.0+** with Command Line Tools
- **Node.js** (for ccusage installation)

### セットアップ

1. **依存関係インストール**

   ```bash
   # ccusage CLI
   npm install -g ccusage

   # Xcode Command Line Tools (if needed)
   xcode-select --install
   ```

2. **開発方法**

   **Option A: Xcode**

   ```bash
   open CCUsageMonitor.xcodeproj
   # Cmd+R でビルド・実行
   ```

   **Option B: Swift CLI**

   ```bash
   swift build
   swift run CCUsageMonitor
   ```

## 📁 プロジェクト構造

```
CCUsageMonitor/
├── 🐳 .devcontainer/              # Dev Container設定
│   ├── devcontainer.json          # コンテナ設定
│   └── setup.sh                   # 環境セットアップ
├── ⚙️  .vscode/                   # VS Code設定
│   ├── settings.json              # エディタ設定
│   ├── launch.json                # デバッグ設定
│   └── tasks.json                 # ビルドタスク
├── 📦 Sources/                    # Swiftソースコード
│   └── CCUsageMonitor/
│       ├── main.swift             # 🚀 エントリポイント
│       ├── ContentView.swift      # 🎨 UI実装
│       ├── UsageMonitor.swift     # 📊 監視ロジック
│       └── CCUsageService.swift   # 🔌 ccusage連携
├── 🔨 CCUsageMonitor.xcodeproj/   # Xcodeプロジェクト
├── 📋 Package.swift               # Swift Package Manager
├── 📖 README.md                   # プロジェクト概要
└── 📚 DEVELOPMENT.md              # 開発ガイド
```

## ⚡ 開発タスク

### VS Code 統合タスク

`Cmd+Shift+P` → 「Tasks: Run Task」

| タスク         | 説明               | コマンド               |
| -------------- | ------------------ | ---------------------- |
| `swift-build`  | プロジェクトビルド | `swift build`          |
| `swift-test`   | テスト実行         | `swift test`           |
| `ccusage-test` | ccusage 動作確認   | `ccusage daily --json` |

### 🔍 デバッグ機能

- ✅ ブレークポイント設定
- ✅ 変数の監視・編集
- ✅ ステップ実行（Step Over/Into/Out）
- ✅ コールスタック表示

## 🩹 トラブルシューティング

### ❌ ccusage が見つからない

```bash
npm install -g ccusage
which ccusage  # パス確認
echo $PATH     # PATH環境変数確認
```

### ❌ Swift 環境の問題

```bash
swift --version              # Swift確認
xcode-select --print-path    # Xcode確認
xcrun --show-sdk-path        # SDK確認
```

### ❌ Dev Container 問題

1. **コンテナ再構築**: `Cmd+Shift+P` → 「Dev Containers: Rebuild Container」
2. **ログ確認**: `Cmd+Shift+P` → 「Dev Containers: Show Container Log」
3. **Docker 確認**: `docker ps` でコンテナ状態確認

---

**🎯 Quick Start**: Dev Container 環境を使用することを強く推奨します！
