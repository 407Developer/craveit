import { env } from '$env/dynamic/private';
import type { ThreadComment } from '$lib/types';

const OFFICIAL_HANDLE = env.OFFICIAL_HANDLE || '@cravit';
const OFFICIAL_NAME = env.OFFICIAL_NAME || 'Cravit Team';

const commentsByItem = new Map<string, ThreadComment[]>();

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function seedThread(itemId: string): ThreadComment[] {
  const rootOfficial: ThreadComment = {
    id: `${itemId}-c1`,
    itemId,
    parentId: null,
    authorHandle: OFFICIAL_HANDLE,
    displayName: OFFICIAL_NAME,
    body: 'Quick summary mode is live. Ask a question in this thread and we will answer with concise context.',
    createdAt: ago(21),
    upvotes: 42,
    official: true,
    pinned: true
  };

  const rootUser: ThreadComment = {
    id: `${itemId}-c2`,
    itemId,
    parentId: null,
    authorHandle: '@builderjay',
    displayName: 'Jay',
    body: 'This source is solid, but the key point is buried around the middle.',
    createdAt: ago(14),
    upvotes: 12
  };

  const replyOfficial: ThreadComment = {
    id: `${itemId}-c3`,
    itemId,
    parentId: rootUser.id,
    authorHandle: OFFICIAL_HANDLE,
    displayName: OFFICIAL_NAME,
    body: 'Good catch. We can add timestamp highlights for long videos in the next iteration.',
    createdAt: ago(11),
    upvotes: 19,
    official: true
  };

  const rootUser2: ThreadComment = {
    id: `${itemId}-c4`,
    itemId,
    parentId: null,
    authorHandle: '@pixelmira',
    displayName: 'Mira',
    body: 'Can we pin one practical takeaway per post? That would help when scrolling fast.',
    createdAt: ago(8),
    upvotes: 7
  };

  return [rootOfficial, rootUser, replyOfficial, rootUser2];
}

function ensureThread(itemId: string) {
  const existing = commentsByItem.get(itemId);
  if (existing) return existing;
  const seeded = seedThread(itemId);
  commentsByItem.set(itemId, seeded);
  return seeded;
}

function hasSupabase() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

function isJwtLike(value: string) {
  return value.split('.').length === 3;
}

function buildSupabaseHeaders(key: string) {
  const headers: Record<string, string> = {
    apikey: key
  };
  // New Supabase secret keys (`sb_secret_...`) are not JWTs.
  // Authorization should only be set for JWT-like keys.
  if (isJwtLike(key)) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

function toModel(row: any): ThreadComment {
  return {
    id: String(row.id),
    itemId: String(row.item_id),
    parentId: row.parent_id ? String(row.parent_id) : null,
    authorHandle: String(row.author_handle || '@you'),
    displayName: String(row.display_name || 'You'),
    body: String(row.body || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
    upvotes: Number(row.upvotes || 0),
    official: Boolean(row.official),
    pinned: Boolean(row.pinned)
  };
}

async function listFromSupabase(itemId: string) {
  const supabaseUrl = env.SUPABASE_URL as string;
  const key = env.SUPABASE_SERVICE_ROLE_KEY as string;
  const table = env.SUPABASE_COMMENTS_TABLE || 'comments';

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set('item_id', `eq.${itemId}`);
  url.searchParams.set('order', 'created_at.asc');

  const response = await fetch(url.toString(), {
    headers: buildSupabaseHeaders(key)
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Supabase comments read failed (${response.status}): ${message}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(toModel) : [];
}

async function addToSupabase(payload: {
  itemId: string;
  body: string;
  parentId?: string | null;
  authorHandle?: string;
  displayName?: string;
}) {
  const supabaseUrl = env.SUPABASE_URL as string;
  const key = env.SUPABASE_SERVICE_ROLE_KEY as string;
  const table = env.SUPABASE_COMMENTS_TABLE || 'comments';

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...buildSupabaseHeaders(key),
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({
      item_id: payload.itemId,
      parent_id: payload.parentId ?? null,
      author_handle: payload.authorHandle?.trim() || '@you',
      display_name: payload.displayName?.trim() || 'You',
      body: payload.body.trim(),
      upvotes: 0,
      official: false,
      pinned: false
    })
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(`Supabase comments insert failed (${response.status}): ${message}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Supabase returned no inserted comment');
  }

  return toModel(rows[0]);
}

export async function listComments(itemId: string) {
  if (hasSupabase()) {
    return await listFromSupabase(itemId);
  }

  return ensureThread(itemId)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addComment(payload: {
  itemId: string;
  body: string;
  parentId?: string | null;
  authorHandle?: string;
  displayName?: string;
}) {
  if (hasSupabase()) {
    return await addToSupabase(payload);
  }

  const comments = ensureThread(payload.itemId);
  const comment: ThreadComment = {
    id: `${payload.itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemId: payload.itemId,
    parentId: payload.parentId ?? null,
    authorHandle: payload.authorHandle?.trim() || '@you',
    displayName: payload.displayName?.trim() || 'You',
    body: payload.body.trim(),
    createdAt: new Date().toISOString(),
    upvotes: 0,
    official: false,
    pinned: false
  };

  comments.push(comment);
  commentsByItem.set(payload.itemId, comments);
  return comment;
}
