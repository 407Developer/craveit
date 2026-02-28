import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addSource, getSources, removeSource, updateSourceWeight } from '$lib/server/sources';
import type { FeedSource } from '$lib/server/providers/rss';

export const GET: RequestHandler = () => {
  return json({
    available: ['youtube', 'reddit', 'web', 'mastodon'],
    connected: getSources(),
    requiresAuth: {
      youtube: false,
      reddit: false,
      web: false,
      mastodon: false
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
    topicTags: payload.topicTags ?? [],
    weight: payload.weight ?? 100
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

export const PATCH: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as { id?: string; weight?: number };
  if (!payload.id || typeof payload.weight !== 'number') {
    return json({ success: false, error: 'Missing source id or weight' }, { status: 400 });
  }
  const updated = updateSourceWeight(payload.id, payload.weight);
  if (!updated) {
    return json({ success: false, error: 'Source not found' }, { status: 404 });
  }
  return json({ success: true, source: updated });
};
