import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Download operations
  startDownload: (url: string) => ipcRenderer.send('download:start', url),
  validateUrl: (url: string) => ipcRenderer.invoke('validate:url', url),
  openFile: (path: string) => ipcRenderer.send('open:file', path),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.send('settings:update', settings),

  // Listeners
  onDownloadProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('download:progress', (_, data) => callback(data));
  },
  onDownloadComplete: (callback: (data: any) => void) => {
    ipcRenderer.on('download:complete', (_, data) => callback(data));
  },
  onDownloadError: (callback: (data: any) => void) => {
    ipcRenderer.on('download:error', (_, data) => callback(data));
  },
  onClipboardUrlDetected: (callback: (url: string) => void) => {
    ipcRenderer.on('clipboard:url-detected', (_, url) => callback(url));
  },

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

declare global {
  interface Window {
    electronAPI: {
      startDownload: (url: string) => void;
      validateUrl: (url: string) => Promise<boolean>;
      openFile: (path: string) => void;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => void;
      onDownloadProgress: (callback: (data: any) => void) => void;
      onDownloadComplete: (callback: (data: any) => void) => void;
      onDownloadError: (callback: (data: any) => void) => void;
      onClipboardUrlDetected: (callback: (url: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
