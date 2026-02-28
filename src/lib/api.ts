import type { FeedItem, FeedResponse, ThreadComment } from './types';

export async function getFeed(params: {
  sources?: string[];
  categories?: string[];
  mediaType?: string;
  cursor?: string;
  focus?: boolean;
  limit?: number;
  query?: string;
  region?: string;
  dateFrom?: string;
  dateTo?: string;
  videoLength?: 'any' | 'short' | 'medium' | 'long';
  intent?: 'all' | 'educational' | 'entertainment' | 'news';
  include?: string[];
  exclude?: string[];
  pulse?: boolean;
  pausedSourceIds?: string[];
}) {
  const query = new URLSearchParams();
  params.sources?.forEach((source) => query.append('source', source));
  params.categories?.forEach((category) => query.append('category', category));
  if (params.mediaType) query.set('mediaType', params.mediaType);
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.focus) query.set('focus', '1');
  if (params.limit) query.set('limit', String(params.limit));
  if (params.query) query.set('q', params.query);
  if (params.region && params.region !== 'global') query.set('region', params.region);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);
  if (params.videoLength && params.videoLength !== 'any') query.set('videoLength', params.videoLength);
  if (params.intent && params.intent !== 'all') query.set('intent', params.intent);
  if (params.pulse) query.set('pulse', '1');
  params.include?.forEach((value) => query.append('include', value));
  params.exclude?.forEach((value) => query.append('exclude', value));
  params.pausedSourceIds?.forEach((id) => query.append('pausedSourceId', id));

  const response = await fetch(`/api/feed?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load feed');
  }

  const data: FeedResponse = await response.json();
  return data;
}

export async function connectSource(provider: string) {
  const response = await fetch(`/api/auth/${provider}`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to connect source');
  }
  return response.json();
}

export async function getSources() {
  const response = await fetch('/api/sources');
  if (!response.ok) {
    throw new Error('Failed to load sources');
  }
  return response.json();
}

export async function resolveSource(params: {
  kind:
    | 'youtube_channel'
    | 'youtube_playlist'
    | 'reddit_subreddit'
    | 'website_rss'
    | 'mastodon_account'
    | 'mastodon_hashtag';
  input: string;
}) {
  const response = await fetch('/api/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    let message = 'Failed to resolve source';
    try {
      const data = await response.json();
      message = data.error ?? message;
    } catch (error) {
      const text = await response.text().catch(() => '');
      if (text) message = text;
    }
    throw new Error(message);
  }
  return response.json();
}

export async function addSource(payload: {
  title: string;
  url: string;
  source: 'youtube' | 'reddit' | 'web' | 'mastodon';
  topicTags?: string[];
  weight?: number;
}) {
  const response = await fetch('/api/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? 'Failed to add source');
  }
  return response.json();
}

export async function removeSource(id: string) {
  const response = await fetch('/api/sources', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? 'Failed to remove source');
  }
  return response.json();
}

export async function updateSourceWeight(id: string, weight: number) {
  const response = await fetch('/api/sources', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, weight })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to update source weight');
  }
  return response.json();
}

export async function getComments(itemId: string) {
  const response = await fetch(`/api/comments?itemId=${encodeURIComponent(itemId)}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to load comments');
  }
  const data = await response.json();
  return (data.comments ?? []) as ThreadComment[];
}

export async function createComment(payload: {
  itemId: string;
  body: string;
  parentId?: string | null;
  authorHandle?: string;
  displayName?: string;
}) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to post comment');
  }

  const data = await response.json();
  return data.comment as ThreadComment;
}
