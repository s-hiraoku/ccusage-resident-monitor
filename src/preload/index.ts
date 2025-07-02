import { contextBridge, ipcRenderer } from 'electron';
import { UsageData, ElectronAPI } from '@shared/types';

// メインプロセスとレンダラープロセス間の安全な通信を提供
const electronAPI: ElectronAPI = {
  // 使用量データの取得
  fetchUsage: (): Promise<UsageData> => {
    return ipcRenderer.invoke('fetch-usage');
  },

  // 使用量更新の監視
  onUsageUpdate: (callback: (usage: UsageData) => void): void => {
    ipcRenderer.on('usage-updated', (_, usage: UsageData) => {
      callback(usage);
    });
  },

  // 使用量更新リスナーの削除
  removeUsageListener: (): void => {
    ipcRenderer.removeAllListeners('usage-updated');
  }
};

// レンダラープロセスでelectronAPIをグローバルに利用可能にする
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 手動更新イベントの監視
ipcRenderer.on('refresh-usage', () => {
  // カスタムイベントをレンダラープロセスに送信
  window.dispatchEvent(new CustomEvent('refresh-usage'));
});

console.log('Preload script loaded');