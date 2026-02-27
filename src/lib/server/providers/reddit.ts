import type { FeedItem } from '$lib/types';
import { env } from '$env/dynamic/private';

const REDDIT_CLIENT_ID = env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = env.REDDIT_USER_AGENT;

const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const REDDIT_SEARCH_URL = 'https://oauth.reddit.com/search';

type TokenCache = {
  token: string;
  expiresAt: number;
} | null;

let tokenCache: TokenCache = null;

async function getRedditToken() {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USER_AGENT) {
    throw new Error('Missing Reddit credentials');
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const auth = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');

  const response = await fetch(REDDIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'User-Agent': REDDIT_USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Reddit token');
  }

  const data = await response.json();
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600;

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (expiresIn - 60) * 1000
  };

  return tokenCache.token;
}

export async function searchReddit(params: {
  query: string;
  maxResults?: number;
  topicTags: string[];
}): Promise<FeedItem[]> {
  const token = await getRedditToken();
  const url = new URL(REDDIT_SEARCH_URL);
  url.searchParams.set('q', params.query);
  url.searchParams.set('limit', String(params.maxResults ?? 10));
  url.searchParams.set('sort', 'new');
  url.searchParams.set('type', 'link');
  url.searchParams.set('raw_json', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': REDDIT_USER_AGENT ?? 'craveit/0.1'
    }
  });

  if (!response.ok) {
    throw new Error('Reddit API request failed');
  }

  const data = await response.json();
  const children = data?.data?.children ?? [];

  return children.map((child: any) => {
    const post = child.data ?? {};
    const thumbnail =
      post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : '';

    return {
      id: `rd-${post.id}`,
      source: 'reddit',
      title: post.title ?? 'Untitled',
      summary: post.selftext?.slice(0, 220) ?? '',
      url: `https://www.reddit.com${post.permalink ?? ''}`,
      mediaType: post.is_video ? 'video' : 'text',
      thumbnailUrl: thumbnail,
      createdAt: post.created_utc
        ? new Date(post.created_utc * 1000).toISOString()
        : new Date().toISOString(),
      author: post.author ?? 'reddit',
      topicTags: params.topicTags,
      score: post.score ?? 0
    } satisfies FeedItem;
  });
}
