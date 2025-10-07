import { useState, useEffect } from 'react';
import { Settings, Download } from '../types';
import UrlInput from './components/UrlInput';
import DownloadList from './components/DownloadList';
import HistoryList from './components/HistoryList';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [history, setHistory] = useState<Download[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load settings
    window.electronAPI.getSettings().then((s) => setSettings(s));

    // Listen for download events
    window.electronAPI.onDownloadProgress((data) => {
      setDownloads((prev) => {
        const existing = prev.find((d) => d.id === data.id);
        if (existing) {
          return prev.map((d) =>
            d.id === data.id
              ? { ...d, ...data }
              : d
          );
        }
        return [...prev, data];
      });
    });

    window.electronAPI.onDownloadComplete((data) => {
      setDownloads((prev) => {
        const updated = prev.map((d) =>
          d.id === data.id
            ? { ...d, status: 'completed' as const, filePath: data.filePath }
            : d
        );

        // Move to history after 3 seconds
        setTimeout(() => {
          const completed = updated.find((d) => d.id === data.id);
          if (completed) {
            setHistory((h) => {
              // Check if already in history to prevent duplicates
              if (h.find(item => item.id === completed.id)) {
                return h;
              }
              return [completed, ...h].slice(0, 10);
            });
            setDownloads((prev) => prev.filter((d) => d.id !== data.id));
          }
        }, 3000);

        return updated;
      });
    });

    window.electronAPI.onDownloadError((data) => {
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === data.id
            ? { ...d, status: 'error', error: data.error }
            : d
        )
      );
    });

    window.electronAPI.onClipboardUrlDetected((url) => {
      setDetectedUrl(url);
      setTimeout(() => setDetectedUrl(null), 5000);
    });

    return () => {
      window.electronAPI.removeAllListeners('download:progress');
      window.electronAPI.removeAllListeners('download:complete');
      window.electronAPI.removeAllListeners('download:error');
      window.electronAPI.removeAllListeners('clipboard:url-detected');
    };
  }, []);

  const handleStartDownload = (url: string) => {
    window.electronAPI.startDownload(url);
    setDetectedUrl(null);
  };

  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
    window.electronAPI.updateSettings(newSettings);
    setSettings((prev) => (prev ? { ...prev, ...newSettings } : null));
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-lg font-semibold">QuickMedia</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Configurações"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {showSettings ? (
        <SettingsPanel
          settings={settings}
          onUpdate={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <>
          {/* Clipboard URL notification */}
          {detectedUrl && (
            <div className="mx-4 mt-3 p-3 bg-accent/20 border border-accent/30 rounded-lg slide-in">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium text-accent">URL detectada</p>
                  <p className="text-xs text-gray-400 truncate">{detectedUrl}</p>
                </div>
                <button
                  onClick={() => handleStartDownload(detectedUrl)}
                  className="px-3 py-1 bg-accent text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Baixar
                </button>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="p-4">
            <UrlInput onSubmit={handleStartDownload} />
          </div>

          {/* Downloads List */}
          {downloads.length > 0 && (
            <div className="px-4 flex-1 overflow-auto">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">
                Downloads Ativos
              </h2>
              <DownloadList downloads={downloads} />
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="px-4 pb-4 flex-1 overflow-auto">
              <h2 className="text-sm font-semibold text-gray-400 mb-2 mt-4">
                Histórico
              </h2>
              <HistoryList history={history} />
            </div>
          )}

          {/* Empty state */}
          {downloads.length === 0 && history.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-3 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                <p className="text-sm">Cole uma URL ou arraste para o ícone</p>
                <p className="text-xs mt-1">Atalho: ⌘ Shift D</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
