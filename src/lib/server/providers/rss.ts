import type { FeedItem } from '$lib/types';
import { parseFeed } from '$lib/server/rss';

export type FeedSource = {
  id: string;
  type: 'rss';
  title: string;
  url: string;
  source: 'youtube' | 'reddit' | 'web';
  topicTags: string[];
};

export async function fetchRssFeed(source: FeedSource): Promise<FeedItem[]> {
  const items = await parseFeed(source.url);

  return items.map((item) => ({
    id: `${source.id}:${item.id}`,
    source: source.source,
    title: item.title || source.title,
    summary: item.summary,
    url: item.link,
    mediaType: source.source === 'youtube' ? 'video' : 'text',
    thumbnailUrl: item.thumbnail,
    createdAt: item.published,
    author: item.author || source.title,
    topicTags: source.topicTags,
    score: undefined
  }));
}
