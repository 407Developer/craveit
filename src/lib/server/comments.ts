import type { ThreadComment } from '$lib/types';

const commentsByItem = new Map<string, ThreadComment[]>();

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function seedThread(itemId: string): ThreadComment[] {
  const rootOfficial: ThreadComment = {
    id: `${itemId}-c1`,
    itemId,
    parentId: null,
    authorHandle: '@cravit',
    displayName: 'Cravit Team',
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
    authorHandle: '@cravit',
    displayName: 'Cravit Team',
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

export function listComments(itemId: string) {
  return ensureThread(itemId)
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addComment(payload: {
  itemId: string;
  body: string;
  parentId?: string | null;
  authorHandle?: string;
  displayName?: string;
}) {
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
