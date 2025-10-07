import { Download } from '../../types';

interface HistoryListProps {
  history: Download[];
}

export default function HistoryList({ history }: HistoryListProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'Agora';
  };

  const handleOpenFile = (filePath: string) => {
    window.electronAPI.openFile(filePath);
  };

  return (
    <div className="space-y-1">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => item.filePath && handleOpenFile(item.filePath)}
          className="p-2 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-success flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate group-hover:text-accent transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">{formatTime(item.timestamp)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
