import { useState } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const isValid = await window.electronAPI.validateUrl(url.trim());
    if (isValid) {
      onSubmit(url.trim());
      setUrl('');
    } else {
      alert('URL inválida');
    }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setUrl(text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const text = e.dataTransfer.getData('text');
    const isValid = await window.electronAPI.validateUrl(text);

    if (isValid) {
      onSubmit(text);
    } else {
      setUrl(text);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL aqui..."
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-accent transition-colors text-sm"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          title="Colar"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </button>
        <button
          type="submit"
          disabled={!url.trim()}
          className="px-4 py-2 bg-accent hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
        >
          Baixar
        </button>
      </form>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-accent bg-accent/10'
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <svg
          className="w-8 h-8 mx-auto mb-2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-400">
          Arraste uma URL aqui
        </p>
      </div>
    </div>
  );
}
