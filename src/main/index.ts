import { app, ipcMain } from 'electron';
import { TrayManager } from './tray';
import { CCUsageService } from './services/ccusage';
import { UsageData } from '@shared/types';

class CCUsageMonitorApp {
  private trayManager: TrayManager | null = null;
  private ccusageService: CCUsageService;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.ccusageService = new CCUsageService();
    this.setupApp();
    this.setupIPC();
  }

  private setupApp(): void {
    // macOSでは、Dockにアイコンを表示しない
    if (process.platform === 'darwin') {
      app.dock?.hide();
    }

    // アプリが準備完了した時の処理
    app.whenReady().then(() => {
      this.trayManager = new TrayManager();
      this.startMonitoring();
      console.log('CCUsage Monitor started');
    });

    // 全てのウィンドウが閉じられても終了しない（システムトレイアプリとして動作）
    app.on('window-all-closed', (event) => {
      event.preventDefault();
    });

    // アプリ終了時のクリーンアップ
    app.on('before-quit', () => {
      this.cleanup();
    });

    // アプリがアクティブになった時（macOS）
    app.on('activate', () => {
      if (this.trayManager) {
        // システムトレイアプリでは特に何もしない
      }
    });
  }

  private setupIPC(): void {
    // レンダラープロセスからの使用量取得要求
    ipcMain.handle('fetch-usage', async (): Promise<UsageData> => {
      try {
        return await this.ccusageService.fetchCurrentUsage();
      } catch (error) {
        console.error('IPC: Failed to fetch usage:', error);
        throw error;
      }
    });

    // レンダラープロセスからの手動更新要求
    ipcMain.on('refresh-usage', async () => {
      await this.fetchAndBroadcastUsage();
    });
  }

  private startMonitoring(): void {
    // 初回取得
    this.fetchAndBroadcastUsage();

    // 30秒間隔で監視
    this.monitoringInterval = setInterval(() => {
      this.fetchAndBroadcastUsage();
    }, 30000); // 30秒

    console.log('Usage monitoring started (30s interval)');
  }

  private async fetchAndBroadcastUsage(): Promise<void> {
    try {
      const usage = await this.ccusageService.fetchCurrentUsage();
      
      // トレイアイコンのタイトルを更新
      if (this.trayManager) {
        this.trayManager.updateTrayTitle({
          totalCost: usage.totalCost,
          dailyUsagePercentage: usage.dailyUsagePercentage
        });
      }

      // レンダラープロセスに使用量データを送信
      if (this.trayManager) {
        // ウィンドウが存在する場合のみ送信
        try {
          const windows = require('electron').BrowserWindow.getAllWindows();
          windows.forEach(window => {
            window.webContents.send('usage-updated', usage);
          });
        } catch (error) {
          console.warn('Failed to broadcast usage update:', error);
        }
      }

      console.log(`Usage updated: $${usage.totalCost.toFixed(4)} (${Math.round(usage.dailyUsagePercentage)}%)`);
    } catch (error) {
      console.error('Failed to fetch and broadcast usage:', error);
    }
  }

  private cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.trayManager) {
      this.trayManager.destroy();
      this.trayManager = null;
    }

    console.log('CCUsage Monitor stopped');
  }
}

// アプリケーションインスタンスを作成
new CCUsageMonitorApp();