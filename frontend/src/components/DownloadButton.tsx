import { useState } from 'react';
import { Download, Loader2, Check, Package } from 'lucide-react';
import { getDownloadUrl } from '../utils/api';

interface DownloadButtonProps {
  shareUrl: string;
  downloadType: 'video' | 'images';
  label?: string;
}

export default function DownloadButton({ shareUrl, downloadType, label }: DownloadButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const isVideo = downloadType === 'video';

  const handleDownload = async () => {
    setState('loading');
    try {
      const endpoint = getDownloadUrl();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shareUrl, download_type: downloadType }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = isVideo ? 'douyin_video.mp4' : 'douyin_images.zip';

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const buttonStyles: Record<string, string> = {
    idle: 'bg-accent hover:bg-accent-hover text-white',
    loading: 'bg-accent/70 text-white',
    done: 'bg-success text-white',
    error: 'bg-error text-white',
  };

  const Icon = isVideo ? Download : Package;
  const StateIcon = state === 'loading' ? Loader2
    : state === 'done' ? Check
    : state === 'error' ? Download
    : Icon;

  const defaultLabel = isVideo ? '下载无水印视频' : '打包下载图片';

  const stateLabel: Record<string, string> = {
    idle: label || defaultLabel,
    loading: '下载中...',
    done: '下载完成',
    error: '下载失败，重试',
  };

  return (
    <button
      onClick={handleDownload}
      disabled={state === 'loading' || state === 'done'}
      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm
                  transition-colors cursor-pointer disabled:cursor-default
                  ${buttonStyles[state]}`}
    >
      <StateIcon size={18} className={state === 'loading' ? 'animate-spin' : ''} />
      {stateLabel[state]}
    </button>
  );
}
