import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addComment, listComments } from '$lib/server/comments';

export const GET: RequestHandler = ({ url }) => {
  const itemId = url.searchParams.get('itemId')?.trim();
  if (!itemId) {
    return json({ success: false, error: 'Missing itemId' }, { status: 400 });
  }

  return json({
    success: true,
    itemId,
    comments: listComments(itemId)
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as {
    itemId?: string;
    body?: string;
    parentId?: string | null;
    authorHandle?: string;
    displayName?: string;
  };

  const itemId = payload.itemId?.trim();
  const body = payload.body?.trim();

  if (!itemId || !body) {
    return json({ success: false, error: 'Missing itemId or body' }, { status: 400 });
  }

  const comment = addComment({
    itemId,
    body,
    parentId: payload.parentId ?? null,
    authorHandle: payload.authorHandle,
    displayName: payload.displayName
  });

  return json({ success: true, comment }, { status: 201 });
};
