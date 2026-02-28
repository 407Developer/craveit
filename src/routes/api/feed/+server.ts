import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { filterFeed } from '$lib/server/feed';
import { fetchRssFeed } from '$lib/server/providers/rss';
import { searchYouTube } from '$lib/server/providers/youtube';
import { getSources } from '$lib/server/sources';
import { buildQueries } from '$lib/server/topics';
import type { FeedItem } from '$lib/types';

const INTENT_KEYWORDS: Record<'educational' | 'entertainment' | 'news', string[]> = {
  educational: ['tutorial', 'guide', 'how to', 'explainer', 'learn', 'walkthrough', 'analysis'],
  entertainment: ['fun', 'reaction', 'vlog', 'music', 'game', 'comedy', 'show'],
  news: ['news', 'update', 'breaking', 'report', 'policy', 'announcement']
};

function parseCursor(input: string | null) {
  if (!input) return 0;
  const value = Number(input);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function matchesIntent(item: FeedItem, intent: 'all' | 'educational' | 'entertainment' | 'news') {
  if (intent === 'all') return true;
  const haystack = `${item.title} ${item.summary} ${item.content ?? ''}`.toLowerCase();
  return INTENT_KEYWORDS[intent].some((keyword) => haystack.includes(keyword));
}

function applySourceWeight(items: FeedItem[], weight = 100) {
  const safeWeight = Math.max(0, Math.min(100, Math.round(weight)));
  if (safeWeight === 0) return [];
  if (safeWeight === 100) return items;
  const takeCount = Math.max(1, Math.ceil(items.length * (safeWeight / 100)));
  return items.slice(0, takeCount);
}

export const GET: RequestHandler = async ({ url }) => {
  const sources = url.searchParams.getAll('source');
  const categories = url.searchParams.getAll('category');
  const mediaType = url.searchParams.get('mediaType');
  const focusMode = url.searchParams.get('focus') === '1';
  const query = url.searchParams.get('q')?.trim() || '';
  const region = url.searchParams.get('region')?.trim() || '';
  const dateFrom = url.searchParams.get('dateFrom')?.trim() || '';
  const dateTo = url.searchParams.get('dateTo')?.trim() || '';
  const include = url.searchParams.getAll('include').map((entry) => entry.toLowerCase()).filter(Boolean);
  const exclude = url.searchParams.getAll('exclude').map((entry) => entry.toLowerCase()).filter(Boolean);
  const pausedSourceIds = new Set(url.searchParams.getAll('pausedSourceId'));
  const pulseMode = url.searchParams.get('pulse') !== '0';
  const intent = (url.searchParams.get('intent')?.trim() || 'all') as
    | 'all'
    | 'educational'
    | 'entertainment'
    | 'news';
  const videoLength = (url.searchParams.get('videoLength')?.trim() || 'any') as
    | 'any'
    | 'short'
    | 'medium'
    | 'long';
  const limit = Math.min(60, Math.max(6, Number(url.searchParams.get('limit') || '12')));
  const offset = parseCursor(url.searchParams.get('cursor'));

  const activeSources = sources.length === 0 ? ['youtube', 'reddit'] : sources;
  const items: FeedItem[] = [];

  const sourceEntries = getSources()
    .filter((source) => activeSources.includes(source.source))
    .filter((source) => !pausedSourceIds.has(source.id))
    .filter((source) => {
      if (categories.length === 0) return true;
      return source.topicTags.some((tag) => categories.includes(tag));
    });

  const rssTasks = sourceEntries.map(async (source) => {
    const feedItems = await fetchRssFeed(source);
    return applySourceWeight(feedItems, source.weight ?? 100);
  });

  if (rssTasks.length > 0) {
    const rssResults = await Promise.allSettled(rssTasks);
    rssResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        items.push(...result.value);
      }
    });
  }

  const youtubeEnabled = sourceEntries.some((entry) => entry.source === 'youtube');
  if (activeSources.includes('youtube') && youtubeEnabled) {
    const topicTags = categories.length > 0 ? categories : ['tech', 'tech updates'];
    const queryCandidates = query ? [query] : buildQueries(categories).slice(0, 2);
    const queries = Array.from(new Set(queryCandidates));
    const youtubeTasks = queries.map((candidate) =>
      searchYouTube({
        query: candidate,
        maxResults: 6,
        topicTags,
        regionCode: region || undefined,
        publishedAfter: dateFrom ? `${dateFrom}T00:00:00Z` : undefined,
        publishedBefore: dateTo ? `${dateTo}T23:59:59Z` : undefined,
        videoDuration: videoLength
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

  const mediaFiltered = merged.filter((item) => {
    if (!mediaType || mediaType === 'all') return true;
    return item.mediaType === mediaType;
  });

  const queryFiltered = query
    ? mediaFiltered.filter((item) => {
        const haystack = `${item.title} ${item.summary} ${item.content ?? ''} ${item.author}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : mediaFiltered;

  const keywordFiltered = queryFiltered.filter((item) => {
    const haystack = `${item.title} ${item.summary} ${item.content ?? ''} ${item.author}`.toLowerCase();
    const includesPass = include.length === 0 || include.every((term) => haystack.includes(term));
    const excludesPass = exclude.length === 0 || exclude.every((term) => !haystack.includes(term));
    return includesPass && excludesPass;
  });

  const intentFiltered = keywordFiltered.filter((item) => {
    if (query && intent === 'all') return true; // Skip intent check if searching and intent is all
    return matchesIntent(item, intent);
  });

  const keywordFinal = query 
    ? queryFiltered.filter((item) => {
        // When searching, inclusion is less strict (at least one match if terms exist)
        const haystack = `${item.title} ${item.summary} ${item.content ?? ''} ${item.author}`.toLowerCase();
        const includesPass = include.length === 0 || include.some((term) => haystack.includes(term));
        const excludesPass = exclude.length === 0 || exclude.every((term) => !haystack.includes(term));
        return includesPass && excludesPass;
      })
    : intentFiltered;

  const dateFiltered = keywordFinal.filter((item) => {
    const ts = new Date(item.createdAt).getTime();
    if (Number.isNaN(ts)) return true;
    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00Z`).getTime();
      if (ts < from) return false;
    }
    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59Z`).getTime();
      if (ts > to) return false;
    }
    return true;
  });

  const deduped = Array.from(
    dateFiltered.reduce((map, item) => {
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

  const sorted = deduped
    .map((item) => ({
      ...item,
      url: focusMode ? '' : item.url
    }))
    .sort((a, b) => {
      const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (pulseMode) return timeDiff;
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return timeDiff;
    });

  const paged = sorted.slice(offset, offset + limit);
  const nextCursor = offset + limit < sorted.length ? String(offset + limit) : null;

  return json(
    {
      items: paged,
      nextCursor,
      total: sorted.length
    },
    {
      headers: {
        'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120'
      }
    }
  );
};
