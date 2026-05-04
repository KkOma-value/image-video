import { Heart, MessageCircle, Share2, User, Image } from 'lucide-react';
import type { ParseResult as ParseResultType } from '../types';
import VideoPreview from './VideoPreview';
import ImageGallery from './ImageGallery';
import DownloadButton from './DownloadButton';

interface ParseResultProps {
  data: ParseResultType;
  shareUrl: string;
}

function formatCount(n: number): string {
  if (n >= 10000) {
    return (n / 10000).toFixed(1) + '万';
  }
  return n.toLocaleString();
}

export default function ParseResult({ data, shareUrl }: ParseResultProps) {
  const hasVideoImages = data.type === 'video' && data.images && data.images.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-bg-surface border border-border rounded-xl overflow-hidden shadow-card">
      {/* Media preview */}
      {data.type === 'video' ? (
        <VideoPreview data={data} />
      ) : (
        <ImageGallery images={data.images} />
      )}

      {/* Extra images for video posts */}
      {hasVideoImages && (
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-3 text-body-sm font-medium text-text-secondary">
            <Image size={16} />
            附带图片 ({data.images!.length}张)
          </div>
          <ImageGallery images={data.images!} />
        </div>
      )}

      {/* Info section */}
      <div className="p-5 space-y-4">
        {/* Description */}
        {data.desc && (
          <p className="text-body text-text-primary leading-relaxed line-clamp-3">
            {data.desc}
          </p>
        )}

        {/* Author + Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.author.avatar_url ? (
              <img
                src={data.author.avatar_url}
                alt={data.author.nickname}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center">
                <User size={18} className="text-text-tertiary" />
              </div>
            )}
            <div>
              <p className="text-body-sm font-medium text-text-primary">
                {data.author.nickname || '未知用户'}
              </p>
              {data.author.unique_id && (
                <p className="text-caption text-text-tertiary">
                  @{data.author.unique_id}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-text-tertiary">
            <span className="flex items-center gap-1 text-caption">
              <Heart size={14} className="text-accent" fill="currentColor" />
              {formatCount(data.stats.digg_count)}
            </span>
            <span className="flex items-center gap-1 text-caption">
              <MessageCircle size={14} />
              {formatCount(data.stats.comment_count)}
            </span>
            <span className="flex items-center gap-1 text-caption">
              <Share2 size={14} />
              {formatCount(data.stats.share_count)}
            </span>
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex gap-3 pt-1 flex-wrap">
          {data.type === 'video' && (
            <DownloadButton shareUrl={shareUrl} downloadType="video" />
          )}
          {data.type === 'image' && (
            <DownloadButton
              shareUrl={shareUrl}
              downloadType="images"
              label={`打包下载图片 (${data.images.length}张)`}
            />
          )}
          {hasVideoImages && (
            <DownloadButton
              shareUrl={shareUrl}
              downloadType="images"
              label={`下载图片合集 (${data.images!.length}张)`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
