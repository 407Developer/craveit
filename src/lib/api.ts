import type { FeedItem, FeedResponse } from './types';

export async function getFeed(params: {
  sources?: string[];
  categories?: string[];
  mediaType?: string;
  cursor?: string;
  focus?: boolean;
}) {
  const query = new URLSearchParams();
  params.sources?.forEach((source) => query.append('source', source));
  params.categories?.forEach((category) => query.append('category', category));
  if (params.mediaType) query.set('mediaType', params.mediaType);
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.focus) query.set('focus', '1');

  const response = await fetch(`/api/feed?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load feed');
  }

  const data: FeedResponse = await response.json();
  return data.items;
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
  kind: 'youtube_channel' | 'youtube_playlist' | 'reddit_subreddit' | 'website_rss';
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
  source: 'youtube' | 'reddit' | 'web';
  topicTags?: string[];
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
