import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

export class TrayManager {
  private tray: Tray | null = null;
  private window: BrowserWindow | null = null;

  constructor() {
    this.createTray();
    this.createWindow();
  }

  private createTray(): void {
    // システムトレイアイコンの作成（一時的にプレースホルダー）
    const icon = this.createPlaceholderIcon();
    
    this.tray = new Tray(icon);
    this.tray.setToolTip('CCUsage Monitor');
    
    // トレイアイコンクリック時の動作
    this.tray.on('click', () => {
      this.toggleWindow();
    });
    
    // 右クリックメニュー
    this.tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Show Usage',
        click: () => this.showWindow()
      },
      {
        type: 'separator'
      },
      {
        label: 'Refresh',
        click: () => this.refreshUsage()
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]));
  }

  private createWindow(): void {
    this.window = new BrowserWindow({
      width: 320,
      height: 280,
      resizable: false,
      frame: false,
      show: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    });

    // 開発環境ではlocalhost、本番環境ではfile://
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      this.window.loadURL('http://localhost:3000');
      // this.window.webContents.openDevTools(); // デバッグ用
    } else {
      this.window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // ウィンドウがフォーカスを失った時に隠す
    this.window.on('blur', () => {
      if (this.window && !this.window.webContents.isDevToolsOpened()) {
        this.window.hide();
      }
    });
  }

  private getIconPath(): string {
    // システムトレイ用のアイコンパスを取得
    const iconName = process.platform === 'darwin' ? 'trayIconTemplate.png' : 'trayIcon.png';
    return path.join(__dirname, '../../assets/icons', iconName);
  }

  private createPlaceholderIcon(): nativeImage {
    // 16x16の簡単なプレースホルダーアイコンを作成
    const size = { width: 16, height: 16 };
    const icon = nativeImage.createEmpty();
    
    // macOSではsetTemplateImageを使用
    if (process.platform === 'darwin') {
      icon.setTemplateImage(true);
    }
    
    // 一時的なアイコンとして返す
    return icon;
  }

  private toggleWindow(): void {
    if (!this.window) return;

    if (this.window.isVisible()) {
      this.window.hide();
    } else {
      this.showWindow();
    }
  }

  private showWindow(): void {
    if (!this.window || !this.tray) return;

    // トレイアイコンの位置を取得してウィンドウを表示
    const trayBounds = this.tray.getBounds();
    const windowBounds = this.window.getBounds();

    // macOSの場合、画面上部のメニューバー近くに表示
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
    const y = Math.round(trayBounds.y + trayBounds.height + 4);

    this.window.setPosition(x, y, false);
    this.window.show();
    this.window.focus();
  }

  private refreshUsage(): void {
    if (this.window) {
      this.window.webContents.send('refresh-usage');
    }
  }

  public updateTrayTitle(usage?: { totalCost: number; dailyUsagePercentage: number }): void {
    if (!this.tray) return;

    if (usage) {
      // 使用量に応じてトレイアイコンのタイトルを更新
      const cost = usage.totalCost.toFixed(2);
      const percentage = Math.round(usage.dailyUsagePercentage);
      this.tray.setTitle(`$${cost} (${percentage}%)`);
    } else {
      this.tray.setTitle('');
    }
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    if (this.window) {
      this.window.destroy();
      this.window = null;
    }
  }
}