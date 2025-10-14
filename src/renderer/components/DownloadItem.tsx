import { Download } from '../../types';

interface DownloadItemProps {
  download: Download;
  onCancel?: (id: string) => void;
}

export default function DownloadItem({ download, onCancel }: DownloadItemProps) {
  const getStatusColor = () => {
    switch (download.status) {
      case 'downloading':
        return 'text-accent';
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (download.status) {
      case 'downloading':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 slide-in">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{download.title}</p>
          {download.status === 'error' && download.error && (
            <p className="text-xs text-red-400 mt-1">{download.error}</p>
          )}
          {download.status === 'downloading' && download.progress && (
            <>
              <div className="mt-2 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${download.progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{download.progress.percentage.toFixed(1)}%</span>
                <span>{download.progress.speed}</span>
                <span>{download.progress.eta}</span>
              </div>
            </>
          )}
          {download.status === 'pending' && (
            <p className="text-xs text-gray-400 mt-1">Na fila...</p>
          )}
          {download.status === 'completed' && (
            <p className="text-xs text-success mt-1">Download concluído</p>
          )}
        </div>
        {(download.status === 'pending' || download.status === 'downloading' || download.status === 'error') && onCancel && (
          <button
            onClick={() => onCancel(download.id)}
            className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-red-400"
            title="Cancelar download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
