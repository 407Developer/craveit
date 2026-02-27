import type { FeedItem } from '$lib/types';
import { env } from '$env/dynamic/private';

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchYouTube(params: {
  query: string;
  maxResults?: number;
  topicTags: string[];
}): Promise<FeedItem[]> {
  const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    throw new Error('Missing YOUTUBE_API_KEY');
  }

  const url = new URL(YOUTUBE_SEARCH_URL);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(params.maxResults ?? 6));
  url.searchParams.set('q', params.query);
  url.searchParams.set('key', YOUTUBE_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('YouTube API request failed');
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.map((item: any) => {
    const snippet = item.snippet ?? {};
    const videoId = item.id?.videoId ?? '';
    return {
      id: `yt-${videoId}`,
      source: 'youtube',
      title: snippet.title ?? 'Untitled',
      summary: snippet.description ?? '',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      mediaType: 'video',
      thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? '',
      createdAt: snippet.publishedAt ?? new Date().toISOString(),
      author: snippet.channelTitle ?? 'YouTube',
      topicTags: params.topicTags
    } satisfies FeedItem;
  });
}
