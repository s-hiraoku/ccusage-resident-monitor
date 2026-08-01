import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { UsageData, ElectronAPI } from '@shared/types';

// メインプロセスとレンダラープロセス間の安全な通信を提供
const electronAPI: ElectronAPI = {
  // 使用量データの取得
  fetchUsage: (): Promise<UsageData> => {
    return ipcRenderer.invoke('fetch-usage');
  },

  // 使用量更新の監視
  onUsageUpdate: (callback: (usage: UsageData) => void): (() => void) => {
    const listener = (_: IpcRendererEvent, usage: UsageData) => {
      callback(usage);
    };
    ipcRenderer.on('usage-updated', listener);
    return () => ipcRenderer.removeListener('usage-updated', listener);
  },

  closeWindow: (): void => ipcRenderer.send('close-window')
};

// レンダラープロセスでelectronAPIをグローバルに利用可能にする
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 手動更新イベントの監視
ipcRenderer.on('refresh-usage', () => {
  // カスタムイベントをレンダラープロセスに送信
  window.dispatchEvent(new CustomEvent('refresh-usage'));
});

console.log('Preload script loaded');
