import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchFullArticle } from '$lib/server/reader';

export const GET: RequestHandler = async ({ url }) => {
  const articleUrl = url.searchParams.get('url');
  if (!articleUrl) {
    return json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const article = await fetchFullArticle(articleUrl);
    if (!article) {
      return json({ error: 'Failed to extract article content' }, { status: 404 });
    }

    return json({ article }, {
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=7200'
      }
    });
  } catch (error: any) {
    return json({ error: error?.message || 'Reader failed' }, { status: 500 });
  }
};
