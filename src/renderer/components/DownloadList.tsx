import { Download } from '../../types';
import DownloadItem from './DownloadItem';

interface DownloadListProps {
  downloads: Download[];
  onCancel?: (id: string) => void;
}

export default function DownloadList({ downloads, onCancel }: DownloadListProps) {
  return (
    <div className="space-y-2">
      {downloads.map((download) => (
        <DownloadItem key={download.id} download={download} onCancel={onCancel} />
      ))}
    </div>
  );
}
