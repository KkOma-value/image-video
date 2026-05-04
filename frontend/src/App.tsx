import { useState } from 'react';
import { AlertCircle, ListChecks, ArrowLeft } from 'lucide-react';
import UrlInput from './components/UrlInput';
import ParseResult from './components/ParseResult';
import BatchInput from './components/BatchInput';
import Footer from './components/Footer';
import { useDouyinParser } from './hooks/useDouyinParser';

type ViewMode = 'single' | 'batch';

function Skeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[9/16] max-h-[480px] bg-bg-input" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-bg-input rounded w-3/4" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-bg-input" />
          <div className="space-y-1.5">
            <div className="h-4 bg-bg-input rounded w-24" />
            <div className="h-3 bg-bg-input rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto p-5 bg-bg-surface border border-error/30 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
        <div>
          <p className="text-body-sm font-medium text-text-primary">解析失败</p>
          <p className="text-body-sm text-text-secondary mt-1">{message}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="mt-3 text-body-sm text-accent hover:text-accent-hover font-medium cursor-pointer"
      >
        点击重试
      </button>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<ViewMode>('single');
  const [shareUrl, setShareUrl] = useState('');
  const { result, status, error, parse, reset } = useDouyinParser();

  const handleParse = (url: string) => {
    setShareUrl(url);
    parse(url);
  };

  const handleBack = () => {
    reset();
    setShareUrl('');
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
          抖音去水印解析下载
        </h1>
        <p className="mt-2 text-body text-text-secondary">
          粘贴分享链接，一键提取无水印视频与图片
        </p>
      </header>

      {/* Mode toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-bg-input rounded-lg p-1">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-1.5 rounded-md text-body-sm font-medium transition-colors cursor-pointer ${
              mode === 'single'
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            单个解析
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-4 py-1.5 rounded-md text-body-sm font-medium transition-colors cursor-pointer ${
              mode === 'batch'
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <ListChecks size={15} className="inline mr-1.5" />
            批量解析
          </button>
        </div>
      </div>

      {/* Input */}
      {mode === 'single' && status !== 'success' && (
        <div className="mb-6">
          <UrlInput onParse={handleParse} isLoading={status === 'loading'} />
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Loading */}
        {status === 'loading' && <Skeleton />}

        {/* Error */}
        {status === 'error' && error && (
          <ErrorCard
            message={error.message}
            onRetry={() => shareUrl && handleParse(shareUrl)}
          />
        )}

        {/* Success */}
        {status === 'success' && result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary
                           hover:text-text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                返回重新解析
              </button>
            </div>
            <ParseResult data={result} shareUrl={shareUrl} />
          </div>
        )}

        {/* Batch mode */}
        {mode === 'batch' && status === 'idle' && !result && (
          <BatchInput />
        )}
      </div>

      {/* Idle state hint */}
      {mode === 'single' && status === 'idle' && (
        <div className="text-center mt-10">
          <p className="text-body-sm text-text-tertiary">
            在抖音 App 中，点击分享按钮，选择「复制链接」，然后粘贴到上方输入框
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
