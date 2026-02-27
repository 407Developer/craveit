import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { filterFeed } from '$lib/server/feed';
import { fetchRssFeed } from '$lib/server/providers/rss';
import { searchYouTube } from '$lib/server/providers/youtube';
import { getSources } from '$lib/server/sources';
import { buildQueries } from '$lib/server/topics';
import type { FeedItem } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
  const sources = url.searchParams.getAll('source');
  const categories = url.searchParams.getAll('category');
  const mediaType = url.searchParams.get('mediaType');
  const focusMode = url.searchParams.get('focus') === '1';
  const limit = Math.min(60, Math.max(6, Number(url.searchParams.get('limit') || '24')));

  const activeSources = sources.length === 0 ? ['youtube', 'reddit'] : sources;
  const items: FeedItem[] = [];

  const tasks = getSources()
    .filter((source) => activeSources.includes(source.source))
    .filter((source) => {
      if (categories.length === 0) return true;
      return source.topicTags.some((tag) => categories.includes(tag));
    })
    .map((source) => fetchRssFeed(source));

  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        items.push(...result.value);
      }
    });
  }

  if (activeSources.includes('youtube')) {
    const topicTags = categories.length > 0 ? categories : ['tech', 'tech updates'];
    const queries = buildQueries(categories).slice(0, 2);
    const youtubeTasks = queries.map((query) =>
      searchYouTube({
        query,
        maxResults: 5,
        topicTags
      })
    );

    if (youtubeTasks.length > 0) {
      const youtubeResults = await Promise.allSettled(youtubeTasks);
      youtubeResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          items.push(...result.value);
        }
      });
    }
  }

  const fallback = filterFeed({
    sources: activeSources,
    categories,
    mediaType: mediaType && mediaType !== 'all' ? (mediaType as 'video' | 'text') : 'all'
  });

  const merged = items.length > 0 ? items : fallback;
  const filtered = merged.filter((item) => {
    if (!mediaType || mediaType === 'all') return true;
    return item.mediaType === mediaType;
  });

  const deduped = Array.from(
    filtered.reduce((map, item) => {
      const key = item.url || `${item.source}:${item.title}:${item.createdAt}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, item);
      } else {
        const itemTime = new Date(item.createdAt).getTime();
        const existingTime = new Date(existing.createdAt).getTime();
        if (itemTime > existingTime) map.set(key, item);
      }
      return map;
    }, new Map<string, FeedItem>()).values()
  );

  const normalized = deduped
    .map((item) => ({
      ...item,
      url: focusMode ? '' : item.url
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return json({
    items: normalized,
    nextCursor: null
  }, {
    headers: {
      'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120'
    }
  });
};
