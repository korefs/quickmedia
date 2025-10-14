import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Download operations
  startDownload: (url: string) => ipcRenderer.send('download:start', url),
  cancelDownload: (id: string) => ipcRenderer.send('download:cancel', id),
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
