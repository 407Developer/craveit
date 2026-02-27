export type MediaType = 'video' | 'text';

export interface FeedItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  url: string;
  mediaType: MediaType;
  thumbnailUrl: string;
  createdAt: string;
  author: string;
  topicTags: string[];
  score?: number;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string | null;
}
