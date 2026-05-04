import { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import type { ImageInfo } from '../types';

interface ImageGalleryProps {
  images: ImageInfo[];
}

function ImageCard({ img }: { img: ImageInfo }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state !== 'idle') return;
    setState('loading');
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `douyin_img_${img.index + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setState('done');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
    }
  };

  return (
    <div className="relative aspect-square bg-bg-input rounded-md overflow-hidden group">
      <img
        src={img.url}
        alt={`图片 ${img.index + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Hover overlay with download button */}
      <button
        onClick={handleDownload}
        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                   flex items-center justify-center cursor-pointer"
        title="下载此图片"
      >
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-full
                     opacity-0 group-hover:opacity-100 transition-all
                     ${state === 'loading' ? 'bg-black/60' : state === 'done' ? 'bg-success' : 'bg-white/90'}`}
        >
          {state === 'loading' ? (
            <Loader2 size={20} className="text-white animate-spin" />
          ) : state === 'done' ? (
            <Check size={20} className="text-white" />
          ) : (
            <Download size={20} className="text-text-primary" />
          )}
        </span>
      </button>
      {/* Resolution badge */}
      <span className="absolute bottom-1 right-1 bg-black/50 text-white text-caption px-1.5 py-0.5 rounded pointer-events-none">
        {img.width}x{img.height}
      </span>
    </div>
  );
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg overflow-hidden">
      {images.map((img) => (
        <ImageCard key={img.index} img={img} />
      ))}
    </div>
  );
}
