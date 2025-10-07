import { spawn } from 'child_process';
import { Notification } from 'electron';
import path from 'path';
import { Settings, Download, DownloadProgress } from '../types';

interface DownloadEventCallback {
  (event: string, data: any): void;
}

// Simple UUID v4 implementation
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class DownloadManager {
  private activeDownloads: Map<string, Download> = new Map();
  private queue: string[] = [];
  private readonly MAX_CONCURRENT = 3;
  private settings: Settings;
  private eventCallback: DownloadEventCallback;

  constructor(settings: Settings, eventCallback: DownloadEventCallback) {
    this.settings = settings;
    this.eventCallback = eventCallback;
  }

  updateSettings(settings: Settings) {
    this.settings = settings;
  }

  startDownload(url: string) {
    const id = uuidv4();

    const download: Download = {
      id,
      url,
      title: 'Loading...',
      status: 'pending',
      timestamp: Date.now(),
    };

    this.activeDownloads.set(id, download);
    this.eventCallback('download:progress', download);

    if (this.getActiveCount() >= this.MAX_CONCURRENT) {
      this.queue.push(id);
    } else {
      this.executeDownload(id);
    }
  }

  private getActiveCount(): number {
    return Array.from(this.activeDownloads.values()).filter(
      (d) => d.status === 'downloading'
    ).length;
  }

  private executeDownload(id: string) {
    const download = this.activeDownloads.get(id);
    if (!download) return;

    download.status = 'downloading';
    this.eventCallback('download:progress', download);

    const args = this.buildYtDlpArgs(download.url);

    const ytDlp = spawn('yt-dlp', args);

    let title = '';

    ytDlp.stdout.on('data', (data: Buffer) => {
      const output = data.toString();

      // Parse progress
      const percentMatch = output.match(/(\d+\.?\d*)%/);
      const speedMatch = output.match(/(\d+\.?\d*\s?[KMG]iB\/s)/);
      const etaMatch = output.match(/ETA\s+(\d+:\d+:\d+|\d+:\d+)/);

      if (percentMatch || speedMatch || etaMatch) {
        const progress: DownloadProgress = {
          percentage: percentMatch ? parseFloat(percentMatch[1]) : download.progress?.percentage || 0,
          speed: speedMatch ? speedMatch[1] : download.progress?.speed || '',
          eta: etaMatch ? etaMatch[1] : download.progress?.eta || '',
        };

        download.progress = progress;
        this.eventCallback('download:progress', { id, progress });
      }

      // Extract title
      if (output.includes('[download] Destination:')) {
        const match = output.match(/Destination:\s*(.+)/);
        if (match) {
          title = path.basename(match[1]);
          download.title = title;
          this.eventCallback('download:progress', { id, title });
        }
      }
    });

    ytDlp.stderr.on('data', (data: Buffer) => {
      const errorOutput = data.toString();
      console.error('yt-dlp stderr:', errorOutput);

      // Check for specific errors
      if (errorOutput.includes('requiring login') || errorOutput.includes('cookies')) {
        download.status = 'error';
        download.error = 'Requer login - Ative cookies nas configurações';
        this.eventCallback('download:error', {
          id,
          error: download.error,
        });
      } else if (errorOutput.includes('ERROR:')) {
        // Extract error message
        const errorMatch = errorOutput.match(/ERROR:\s*(.+)/);
        if (errorMatch) {
          download.status = 'error';
          download.error = errorMatch[1].substring(0, 100); // Limit to 100 chars
          this.eventCallback('download:error', {
            id,
            error: download.error,
          });
        }
      }
    });

    ytDlp.on('close', (code) => {
      if (code === 0) {
        download.status = 'completed';
        download.filePath = path.join(this.settings.downloadPath, title || 'download');

        this.eventCallback('download:complete', {
          id,
          filePath: download.filePath,
        });

        if (this.settings.notifications) {
          const notification = new Notification({
            title: 'Download concluído',
            body: title || 'Download finalizado com sucesso',
          });
          notification.show();
        }
      } else {
        download.status = 'error';
        download.error = `Download falhou com código ${code}`;

        this.eventCallback('download:error', {
          id,
          error: download.error,
        });

        if (this.settings.notifications) {
          const notification = new Notification({
            title: 'Erro no download',
            body: 'Falha ao baixar o arquivo',
          });
          notification.show();
        }
      }

      // Process queue
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.getActiveCount() < this.MAX_CONCURRENT) {
      const nextId = this.queue.shift();
      if (nextId) {
        this.executeDownload(nextId);
      }
    }
  }

  private buildYtDlpArgs(url: string): string[] {
    const args: string[] = [];

    // Output template
    args.push('-o', path.join(this.settings.downloadPath, '%(title)s.%(ext)s'));

    // Cookies (for sites requiring login like TikTok, Instagram, etc)
    if (this.settings.useCookies && this.settings.cookiesBrowser) {
      console.log('Using cookies from browser:', this.settings.cookiesBrowser);
      args.push('--cookies-from-browser', this.settings.cookiesBrowser);
    }

    // Quality settings
    if (this.settings.quality === 'audio') {
      args.push('-x');
      args.push('--audio-format', this.settings.format === 'mp3' ? 'mp3' : 'mp3');
    } else {
      if (this.settings.quality === '1080p') {
        args.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]');
      } else if (this.settings.quality === '720p') {
        args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]');
      }

      // Merge to preferred format
      if (this.settings.format !== 'mp4') {
        args.push('--merge-output-format', this.settings.format);
      }
    }

    // Progress output
    args.push('--progress');
    args.push('--newline');

    // URL
    args.push(url);

    return args;
  }
}
