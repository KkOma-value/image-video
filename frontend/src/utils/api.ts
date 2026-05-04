import type { ParseResponse, BatchResponse } from '../types';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function parseLink(url: string): Promise<ParseResponse> {
  return request<ParseResponse>('/parse', { url });
}

export async function parseBatch(urls: string[]): Promise<BatchResponse> {
  return request<BatchResponse>('/parse/batch', { urls });
}

export function getDownloadUrl(): string {
  return `${BASE_URL}/download`;
}
