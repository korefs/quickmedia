import { useState } from 'react';
import { Settings, DownloadQuality, DownloadFormat } from '../../types';

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const [downloadPath, setDownloadPath] = useState(settings.downloadPath);

  const handleSelectFolder = async () => {
    // In a real implementation, you would use electron dialog
    // For now, we'll use a simple prompt
    const path = prompt('Digite o caminho da pasta:', downloadPath);
    if (path) {
      setDownloadPath(path);
      onUpdate({ downloadPath: path });
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 slide-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Configurações</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Download Path */}
        <div>
          <label className="block text-sm font-medium mb-2">Pasta de destino</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={downloadPath}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
            />
            <button
              onClick={handleSelectFolder}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Escolher
            </button>
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium mb-2">Qualidade</label>
          <select
            value={settings.quality}
            onChange={(e) => onUpdate({ quality: e.target.value as DownloadQuality })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-sm"
          >
            <option value="best">Melhor</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="audio">Apenas Áudio</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium mb-2">Formato preferido</label>
          <select
            value={settings.format}
            onChange={(e) => onUpdate({ format: e.target.value as DownloadFormat })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-sm"
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="mp3">MP3 (para áudio)</option>
          </select>
        </div>

        {/* Auto-download Clipboard */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Auto-download do clipboard</p>
            <p className="text-xs text-gray-400">Detectar URLs copiadas automaticamente</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoDownloadClipboard}
              onChange={(e) => onUpdate({ autoDownloadClipboard: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notificações</p>
            <p className="text-xs text-gray-400">Mostrar notificações ao concluir</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => onUpdate({ notifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Start with System */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Iniciar com o sistema</p>
            <p className="text-xs text-gray-400">Abrir ao fazer login no macOS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.startWithSystem}
              onChange={(e) => onUpdate({ startWithSystem: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Use Cookies */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Usar cookies do navegador</p>
            <p className="text-xs text-gray-400">Para sites que requerem login (TikTok, Instagram)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useCookies}
              onChange={(e) => onUpdate({ useCookies: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {/* Browser for Cookies */}
        {settings.useCookies && (
          <div>
            <label className="block text-sm font-medium mb-2">Navegador</label>
            <select
              value={settings.cookiesBrowser}
              onChange={(e) => onUpdate({ cookiesBrowser: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-accent text-sm"
            >
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
              <option value="edge">Edge</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Certifique-se de estar logado no site no navegador selecionado
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            QuickMedia v1.0.0
          </p>
          <p className="text-xs text-gray-600 text-center mt-1">
            Atalho global: ⌘ Shift D
          </p>
        </div>
      </div>
    </div>
  );
}
