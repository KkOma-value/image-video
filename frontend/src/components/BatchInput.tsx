import { useState } from 'react';
import { ListChecks, Loader2 } from 'lucide-react';
import type { BatchResultItem } from '../types';
import { parseBatch } from '../utils/api';
import ParseResult from './ParseResult';

export default function BatchInput() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResultItem[]>([]);

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleBatchParse = async () => {
    const urlList = urls.split('\n').map(normalizeUrl).filter(Boolean);
    if (!urlList.length || loading) return;

    setLoading(true);
    setResults([]);

    try {
      const res = await parseBatch(urlList);
      if (res.success && res.data) {
        setResults(res.data.results);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="space-y-3">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={'每行粘贴一个抖音链接...\n\n例如：\nhttps://v.douyin.com/xxxxx/\nhttps://v.douyin.com/yyyyy/'}
          disabled={loading}
          rows={5}
          className="w-full p-4 bg-bg-input border border-border rounded-[10px]
                     text-body text-text-primary placeholder:text-text-tertiary resize-y
                     focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-text-primary/10
                     disabled:opacity-60 transition-colors"
        />
        <button
          onClick={handleBatchParse}
          disabled={!urls.trim() || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white
                     font-medium rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors cursor-pointer"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ListChecks size={18} />
          )}
          {loading ? '批量解析中...' : '批量解析'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-body-sm text-text-secondary">
            共 {results.length} 个结果，成功 {results.filter((r) => r.success).length} 个
          </p>
          {results.map((item, i) => (
            <div key={i}>
              {item.success && item.data ? (
                <ParseResult data={item.data} shareUrl={item.url} />
              ) : (
                <div className="p-4 bg-bg-surface border border-error/20 rounded-lg text-body-sm text-error">
                  <span className="font-medium">{item.url}</span>
                  <span className="ml-2">{item.error?.message || '解析失败'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
