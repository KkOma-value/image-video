import { useState, useRef } from 'react';
import type { ParseResult, ParseStatus, ApiError } from '../types';
import { parseLink } from '../utils/api';

interface UseDouyinParserReturn {
  result: ParseResult | null;
  status: ParseStatus;
  error: ApiError | null;
  parse: (url: string) => Promise<void>;
  reset: () => void;
}

export function useDouyinParser(): UseDouyinParserReturn {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const parse = async (url: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const res = await parseLink(url);
      if (controller.signal.aborted) return;

      if (res.success && res.data) {
        setResult(res.data);
        setStatus('success');
      } else if (res.error) {
        setError(res.error);
        setStatus('error');
      } else {
        setError({ code: 'UNKNOWN', message: '解析失败，请重试' });
        setStatus('error');
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError({ code: 'NETWORK', message: '网络请求失败，请检查网络后重试' });
      setStatus('error');
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setResult(null);
    setStatus('idle');
    setError(null);
  };

  return { result, status, error, parse, reset };
}
