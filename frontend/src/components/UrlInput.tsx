import { useState, type FormEvent } from 'react';
import { Link, Loader2 } from 'lucide-react';

interface UrlInputProps {
  onParse: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onParse, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (normalized && !isLoading) {
      onParse(normalized);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Link
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴抖音分享链接，如 v.douyin.com/xxxxx/（自动补全协议）"
            disabled={isLoading}
            className="w-full h-12 pl-11 pr-4 bg-bg-input border border-border rounded-[10px]
                       text-body text-text-primary placeholder:text-text-tertiary
                       focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-text-primary/10
                       disabled:opacity-60 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="h-12 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                     flex items-center gap-2 shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          {isLoading ? '解析中...' : '解析'}
        </button>
      </div>
    </form>
  );
}
