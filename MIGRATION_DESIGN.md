# CCUsage Monitor - TypeScript移行設計ドキュメント

## 現在のSwiftプロジェクト分析

### 主要コンポーネント

#### 1. CCUsageService.swift
**機能：** ccusage CLIとの統合
- `ccusage daily --json` コマンドを実行
- JSON レスポンスを解析
- エラーハンドリング（コマンド未発見、実行失敗、JSON解析失敗）

**データ構造：**
```swift
struct CCUsageResponse: Codable {
  let inputTokens: Int     // input_tokens
  let outputTokens: Int    // output_tokens  
  let totalCost: Double    // total_cost
  let date: String?
}
```

#### 2. UsageMonitor.swift
**機能：** 使用量監視とデータ管理
- 30秒間隔での自動更新
- 状態管理（@Published プロパティ）
- 使用率計算（固定$20/日基準）

**データ構造：**
```swift
struct UsageData {
  let inputTokens: Int
  let outputTokens: Int
  let totalCost: Double
  let dailyLimit: Double?
  let dailyUsagePercentage: Double
  let lastUpdated: Date
}
```

#### 3. ContentView.swift
**機能：** UI表示
- ヘッダー（アイコン + タイトル）
- 使用量表示（トークン数、コスト、進捗）
- 操作ボタン（Refresh, Quit）
- プログレスバー（カラーコーディング：緑/オレンジ/赤）

#### 4. main.swift
**機能：** アプリケーションエントリポイント
- MenuBarExtra でシステムトレイ対応
- 状態管理の環境オブジェクト注入

## TypeScript/Electron 移行プラン

### プロジェクト構造
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
│   │   ├── components/
│   │   │   ├── UsageDisplay.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Controls.tsx
│   │   └── store/
│   │       └── usage-store.ts  # Zustand store
│   ├── shared/                 # 共有型定義
│   │   └── types.ts
│   └── preload/
│       └── index.ts            # IPC bridge
├── assets/
│   └── icons/                  # トレイアイコン
├── build/                      # ビルド設定
└── package.json
```

### 型定義（TypeScript）
```typescript
// shared/types.ts
export interface CCUsageResponse {
  input_tokens: number;
  output_tokens: number;
  total_cost: number;
  date?: string;
}

export interface UsageData {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  dailyLimit?: number;
  dailyUsagePercentage: number;
  lastUpdated: Date;
  totalTokens: number;
}

export enum CCUsageError {
  COMMAND_NOT_FOUND = 'COMMAND_NOT_FOUND',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  JSON_PARSING_FAILED = 'JSON_PARSING_FAILED',
  NO_DATA = 'NO_DATA'
}
```

### 主要サービス実装

#### CCUsage Service (Node.js)
```typescript
// main/services/ccusage.ts
import { spawn } from 'child_process';
import { CCUsageResponse, UsageData, CCUsageError } from '../../shared/types';

export class CCUsageService {
  private readonly command = 'ccusage';
  
  async fetchCurrentUsage(): Promise<UsageData> {
    const output = await this.executeCommand([this.command, 'daily', '--json']);
    const response = this.parseJSON(output);
    
    return {
      inputTokens: response.input_tokens,
      outputTokens: response.output_tokens,
      totalCost: response.total_cost,
      dailyLimit: undefined, // MVP: 固定制限なし
      dailyUsagePercentage: this.calculateUsagePercentage(response.total_cost),
      lastUpdated: new Date(),
      totalTokens: response.input_tokens + response.output_tokens
    };
  }
  
  private executeCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('env', args);
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`${CCUsageError.EXECUTION_FAILED}: ${error}`));
        }
      });
      
      process.on('error', (err) => {
        reject(new Error(`${CCUsageError.COMMAND_NOT_FOUND}: ${err.message}`));
      });
    });
  }
  
  private parseJSON(jsonString: string): CCUsageResponse {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Raw JSON:', jsonString);
      throw new Error(CCUsageError.JSON_PARSING_FAILED);
    }
  }
  
  private calculateUsagePercentage(cost: number): number {
    // MVP: 仮の計算（$20/日を100%として計算）
    const dailyBudget = 20.0;
    return Math.min((cost / dailyBudget) * 100.0, 100.0);
  }
}
```

### 状態管理（Zustand）
```typescript
// renderer/store/usage-store.ts
import { create } from 'zustand';
import { UsageData } from '../../shared/types';

interface UsageStore {
  currentUsage: UsageData | null;
  isMonitoring: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUsage: (usage: UsageData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  refreshUsage: () => void;
}

export const useUsageStore = create<UsageStore>((set, get) => ({
  currentUsage: null,
  isMonitoring: false,
  isLoading: false,
  error: null,
  
  setUsage: (usage) => set({ currentUsage: usage, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  startMonitoring: () => {
    set({ isMonitoring: true });
    // 30秒間隔での監視開始
    setInterval(() => {
      get().refreshUsage();
    }, 30000);
    get().refreshUsage(); // 初回実行
  },
  
  stopMonitoring: () => set({ isMonitoring: false }),
  
  refreshUsage: async () => {
    set({ isLoading: true });
    try {
      // IPC経由でメインプロセスのccusageサービスを呼び出し
      const usage = await window.electronAPI.fetchUsage();
      set({ currentUsage: usage, error: null });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));
```

### React UI コンポーネント
```typescript
// renderer/components/UsageDisplay.tsx
import React from 'react';
import { UsageData } from '../../shared/types';

interface UsageDisplayProps {
  usage: UsageData;
}

export const UsageDisplay: React.FC<UsageDisplayProps> = ({ usage }) => {
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    return 'text-green-500';
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Input Tokens:</span>
        <span className="font-semibold">{usage.inputTokens.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Output Tokens:</span>
        <span className="font-semibold">{usage.outputTokens.toLocaleString()}</span>
      </div>
      
      <div className="flex justify-between">
        <span>Total Cost:</span>
        <span className={`font-semibold ${usage.totalCost > 10 ? 'text-red-500' : ''}`}>
          ${usage.totalCost.toFixed(4)}
        </span>
      </div>
      
      {usage.dailyLimit && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Daily Progress:</span>
            <span className={`font-semibold ${getProgressColor(usage.dailyUsagePercentage)}`}>
              {Math.round(usage.dailyUsagePercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usage.dailyUsagePercentage >= 90 ? 'bg-red-500' :
                usage.dailyUsagePercentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usage.dailyUsagePercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center text-sm text-gray-500">
        <span className="mr-2">🕒</span>
        <span>Updated: {formatTime(usage.lastUpdated)}</span>
      </div>
    </div>
  );
};
```

## 移行ステップ

### Phase 1: プロジェクトセットアップ
1. Electron + TypeScript + React プロジェクト初期化
2. 必要な依存関係のインストール
3. ビルド設定（webpack, tsconfig）

### Phase 2: コア機能移行
1. CCUsageService のTypeScript実装
2. IPC通信の設定（main ↔ renderer）
3. Zustand状態管理の実装

### Phase 3: UI実装
1. React コンポーネント作成
2. Tailwind CSS でのスタイリング
3. システムトレイ統合

### Phase 4: 機能拡張
1. 設定画面の追加
2. 永続化機能
3. 通知機能

このドキュメントに基づいて、TypeScriptでの再実装を進めます。