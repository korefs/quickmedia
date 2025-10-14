export type DownloadQuality = 'best' | '1080p' | '720p' | 'audio';
export type DownloadFormat = 'mp4' | 'webm' | 'mp3';
export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'error';

export interface Settings {
  downloadPath: string;
  quality: DownloadQuality;
  format: DownloadFormat;
  autoDownloadClipboard: boolean;
  notifications: boolean;
  startWithSystem: boolean;
  useCookies: boolean;
  cookiesBrowser: 'chrome' | 'firefox' | 'safari' | 'edge';
}

export interface DownloadProgress {
  percentage: number;
  speed: string;
  eta: string;
}

export interface Download {
  id: string;
  url: string;
  title: string;
  status: DownloadStatus;
  progress?: DownloadProgress;
  error?: string;
  timestamp: number;
  filePath?: string;
}

export interface IpcChannels {
  'download:start': (url: string) => void;
  'download:cancel': (id: string) => void;
  'download:progress': (data: { id: string; progress: DownloadProgress }) => void;
  'download:complete': (data: { id: string; filePath: string }) => void;
  'download:error': (data: { id: string; error: string }) => void;
  'settings:get': () => Settings;
  'settings:update': (settings: Partial<Settings>) => void;
  'clipboard:url-detected': (url: string) => void;
  'validate:url': (url: string) => Promise<boolean>;
  'open:file': (path: string) => void;
}
