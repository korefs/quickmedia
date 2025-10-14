declare global {
  interface Window {
    electronAPI: {
      startDownload: (url: string) => void;
      cancelDownload: (id: string) => void;
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

export {};
