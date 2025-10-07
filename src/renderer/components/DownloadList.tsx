import { Download } from '../../types';
import DownloadItem from './DownloadItem';

interface DownloadListProps {
  downloads: Download[];
}

export default function DownloadList({ downloads }: DownloadListProps) {
  return (
    <div className="space-y-2">
      {downloads.map((download) => (
        <DownloadItem key={download.id} download={download} />
      ))}
    </div>
  );
}
