import { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, clipboard, Notification, shell, nativeImage } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { DownloadManager } from './download-manager';
import { Settings } from '../types';

const store = new Store<{ settings: Settings; history: any[] }>();
let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let downloadManager: DownloadManager;
let lastClipboardText = '';

const defaultSettings: Settings = {
  downloadPath: path.join(app.getPath('home'), 'Downloads'),
  quality: 'best',
  format: 'mp4',
  autoDownloadClipboard: false,
  notifications: true,
  startWithSystem: false,
  useCookies: false,
  cookiesBrowser: 'chrome',
};

function createWindow() {
  const preloadPath = path.join(__dirname, '../preload.js');

  mainWindow = new BrowserWindow({
    width: 400,
    height: 550,
    show: false,
    frame: false,
    resizable: false,
    transparent: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    skipTaskbar: true,
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Position window near tray icon
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
}

function createTray() {
  // Load the tray icon
  let icon: Electron.NativeImage;

  // Try to load from assets folder
  const iconPath = path.join(__dirname, '../../assets/icon.png');

  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      // Fallback: create a simple template icon for macOS
      icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpZIxSgNBFIa/2U0MWFhYWFhYWNjYWVlYWFhYWFhY2NhY2FhYWFhYWNhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFjYeE');
    } else {
      // Resize icon to proper tray size (22x22 for macOS)
      icon = icon.resize({ width: 22, height: 22 });
    }
  } catch (error) {
    console.error('Error loading tray icon:', error);
    // Create a simple colored square as fallback
    icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpZIxSgNBFIa/2U0MWFhYWFhYWNjYWVlYWFhYWFhY2NhY2FhYWFhYWNhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFjYeE');
  }

  // Set template on macOS for auto dark/light mode
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('QuickMedia');

  // Handle left click on tray icon - toggle window
  tray.on('click', () => {
    toggleWindow();
  });

  // Handle right click - show context menu
  tray.on('right-click', () => {
    if (!tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show QuickMedia',
        click: () => {
          showWindow();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);
    tray.popUpContextMenu(contextMenu);
  });

  // Handle drag and drop of URLs
  tray.on('drop-text', (_event, text) => {
    if (isValidUrl(text)) {
      downloadManager.startDownload(text);
    }
  });
}

function toggleWindow() {
  if (!mainWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

function showWindow() {
  if (!mainWindow || !tray) return;

  const trayBounds = tray.getBounds();
  const windowBounds = mainWindow.getBounds();

  // Position window near tray icon (macOS menu bar)
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 5);

  mainWindow.setPosition(x, y, false);
  mainWindow.show();
  mainWindow.focus();
}

function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function monitorClipboard() {
  setInterval(() => {
    const settings = store.get('settings', defaultSettings);
    if (!settings.autoDownloadClipboard) return;

    const currentText = clipboard.readText();
    if (currentText !== lastClipboardText && isValidUrl(currentText)) {
      lastClipboardText = currentText;

      // Notify renderer about detected URL
      mainWindow?.webContents.send('clipboard:url-detected', currentText);

      if (settings.notifications) {
        const notification = new Notification({
          title: 'URL detectada',
          body: 'Clique para baixar',
          silent: true,
        });

        notification.on('click', () => {
          downloadManager.startDownload(currentText);
        });

        notification.show();
      }
    }
  }, 1000);
}

function registerGlobalShortcut() {
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    const text = clipboard.readText();
    if (isValidUrl(text)) {
      downloadManager.startDownload(text);
    }
  });
}

// IPC Handlers
function setupIpcHandlers() {
  ipcMain.on('download:start', (_event, url: string) => {
    downloadManager.startDownload(url);
  });

  ipcMain.handle('validate:url', async (_event, url: string) => {
    return isValidUrl(url);
  });

  ipcMain.handle('settings:get', () => {
    return store.get('settings', defaultSettings);
  });

  ipcMain.on('settings:update', (_event, settings: Partial<Settings>) => {
    const current = store.get('settings', defaultSettings);
    const updated = { ...current, ...settings };
    store.set('settings', updated);

    // Update download manager settings
    if (downloadManager) {
      downloadManager.updateSettings(updated);
    }

    // Update login item
    if ('startWithSystem' in settings) {
      app.setLoginItemSettings({
        openAtLogin: settings.startWithSystem,
      });
    }
  });

  ipcMain.on('open:file', (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize download manager with merged settings (to handle new fields)
  const storedSettings = store.get('settings', defaultSettings);
  const settings = { ...defaultSettings, ...storedSettings };
  store.set('settings', settings); // Save merged settings

  downloadManager = new DownloadManager(settings, (event, data) => {
    mainWindow?.webContents.send(event, data);
  });

  createTray();
  createWindow();
  setupIpcHandlers();
  registerGlobalShortcut();
  monitorClipboard();
});

app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.dock?.hide(); // Hide from dock on macOS
