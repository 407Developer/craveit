import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addComment, listComments } from '$lib/server/comments';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const itemId = url.searchParams.get('itemId')?.trim();
    if (!itemId) {
      return json({ success: false, error: 'Missing itemId' }, { status: 400 });
    }

    const comments = await listComments(itemId);
    return json({
      success: true,
      itemId,
      comments
    });
  } catch (error: any) {
    return json(
      { success: false, error: error?.message ?? 'Failed to load comments' },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
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

    const comment = await addComment({
      itemId,
      body,
      parentId: payload.parentId ?? null,
      authorHandle: payload.authorHandle,
      displayName: payload.displayName
    });

    return json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    return json(
      { success: false, error: error?.message ?? 'Failed to post comment' },
      { status: 500 }
    );
  }
};
