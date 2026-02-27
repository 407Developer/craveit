import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addSource, getSources, removeSource } from '$lib/server/sources';
import type { FeedSource } from '$lib/server/providers/rss';

export const GET: RequestHandler = () => {
  return json({
    available: ['youtube', 'reddit', 'web'],
    connected: getSources(),
    requiresAuth: {
      youtube: false,
      reddit: false,
      web: false
    }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as Partial<FeedSource>;
  if (!payload.url || !payload.title || !payload.source) {
    return json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  const source: FeedSource = {
    id: payload.id ?? `custom-${Date.now()}`,
    type: 'rss',
    title: payload.title,
    url: payload.url,
    source: payload.source,
    topicTags: payload.topicTags ?? []
  };

  addSource(source);
  return json({ success: true, source });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as { id?: string };
  if (!payload.id) {
    return json({ success: false, error: 'Missing source id' }, { status: 400 });
  }
  removeSource(payload.id);
  return json({ success: true });
};
