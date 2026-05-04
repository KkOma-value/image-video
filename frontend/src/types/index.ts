export interface AuthorInfo {
  nickname: string;
  unique_id: string;
  avatar_url: string;
}

export interface StatsInfo {
  digg_count: number;
  comment_count: number;
  share_count: number;
  collect_count: number;
}

export interface ImageInfo {
  url: string;
  width: number;
  height: number;
  index: number;
}

export interface VideoResult {
  type: 'video';
  aweme_id: string;
  desc: string;
  video_url: string;
  cover_url: string;
  width: number;
  height: number;
  author: AuthorInfo;
  stats: StatsInfo;
  images: ImageInfo[];
}

export interface ImageResult {
  type: 'image';
  aweme_id: string;
  desc: string;
  images: ImageInfo[];
  author: AuthorInfo;
  stats: StatsInfo;
}

export type ParseResult = VideoResult | ImageResult;

export interface ApiError {
  code: string;
  message: string;
}

export interface ParseResponse {
  success: boolean;
  data?: ParseResult;
  error?: ApiError;
}

export interface BatchResultItem {
  url: string;
  success: boolean;
  data?: ParseResult;
  error?: ApiError;
}

export interface BatchResponse {
  success: boolean;
  data?: {
    total: number;
    results: BatchResultItem[];
  };
  error?: ApiError;
}

export type ParseStatus = 'idle' | 'loading' | 'success' | 'error';
