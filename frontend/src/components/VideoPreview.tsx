import { Play } from 'lucide-react';
import type { VideoResult } from '../types';

interface VideoPreviewProps {
  data: VideoResult;
}

export default function VideoPreview({ data }: VideoPreviewProps) {
  return (
    <div className="relative group rounded-lg overflow-hidden bg-black/5">
      {data.cover_url ? (
        <img
          src={data.cover_url}
          alt={data.desc}
          className="w-full aspect-[9/16] object-cover max-h-[480px]"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[9/16] max-h-[480px] bg-bg-input flex items-center justify-center">
          <Play size={48} className="text-text-tertiary" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Play size={24} className="text-text-primary ml-0.5" fill="currentColor" />
        </div>
      </div>
      {data.width > 0 && (
        <span className="absolute top-2 right-2 bg-black/60 text-white text-caption px-2 py-0.5 rounded">
          {data.width}x{data.height}
        </span>
      )}
    </div>
  );
}
