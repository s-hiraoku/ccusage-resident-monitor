export interface CCUsageResponse {
  daily: Array<{
    date: string;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    totalTokens?: number;
    modelsUsed?: string[];
    modelBreakdowns?: any[];
  }>;
  totals?: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
    totalCost: number;
    totalTokens?: number;
  };
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

export interface ElectronAPI {
  fetchUsage: () => Promise<UsageData>;
  onUsageUpdate: (callback: (usage: UsageData) => void) => void;
  removeUsageListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}