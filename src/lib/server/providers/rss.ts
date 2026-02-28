import type { FeedItem } from '$lib/types';
import { parseFeed } from '$lib/server/rss';

export type FeedSource = {
  id: string;
  type: 'rss';
  title: string;
  url: string;
  source: 'youtube' | 'reddit' | 'web' | 'mastodon';
  topicTags: string[];
  weight?: number;
};

type FeedCacheEntry = {
  expiresAt: number;
  items: FeedItem[];
};

const FEED_CACHE_TTL_MS = 2 * 60 * 1000;
const feedCache = new Map<string, FeedCacheEntry>();

export async function fetchRssFeed(source: FeedSource): Promise<FeedItem[]> {
  const cached = feedCache.get(source.id);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.items;
  }

  const items = await parseFeed(source.url);

  function computeReadTime(text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return undefined;
    return Math.max(1, Math.round(words / 200));
  }

  const normalized = items.map((item) => ({
    id: `${source.id}:${item.id}`,
    source: source.source,
    sourceId: source.id,
    title: item.title || source.title,
    summary: item.summary,
    content: item.content,
    url: item.link,
    mediaType: source.source === 'youtube' ? ('video' as const) : ('text' as const),
    thumbnailUrl: item.thumbnail,
    createdAt: item.published,
    author: item.author || source.title,
    topicTags: source.topicTags,
    score: undefined,
    readTimeMinutes: source.source === 'youtube' ? undefined : computeReadTime(item.content || item.summary)
  }));

  feedCache.set(source.id, {
    expiresAt: Date.now() + FEED_CACHE_TTL_MS,
    items: normalized
  });

  return normalized;
}
