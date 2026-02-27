<script lang="ts">
  import { createComment, getComments } from '$lib/api';
  import type { ThreadComment } from '$lib/types';

  let { itemId } = $props<{ itemId: string }>();

  let loading = $state(false);
  let saving = $state(false);
  let error = $state('');
  let comments = $state<ThreadComment[]>([]);
  let draft = $state('');
  let replyTo = $state<ThreadComment | null>(null);

  function fmt(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  async function refresh() {
    if (!itemId) return;
    loading = true;
    error = '';
    try {
      comments = await getComments(itemId);
    } catch (e: any) {
      error = e?.message ?? 'Could not load comments';
    } finally {
      loading = false;
    }
  }

  async function postComment() {
    const body = draft.trim();
    if (!body || saving) return;

    saving = true;
    error = '';
    try {
      const posted = await createComment({
        itemId,
        body,
        parentId: replyTo?.id ?? null,
        authorHandle: '@you',
        displayName: 'You'
      });
      comments = [...comments, posted];
      draft = '';
      replyTo = null;
    } catch (e: any) {
      error = e?.message ?? 'Could not post comment';
    } finally {
      saving = false;
    }
  }

  const pinned = $derived(comments.filter((c) => c.pinned));
  const roots = $derived(comments.filter((c) => !c.pinned && !c.parentId));

  function repliesFor(parentId: string) {
    return comments.filter((c) => c.parentId === parentId);
  }

  $effect(() => {
    itemId;
    refresh();
  });
</script>

<section class="thread-wrap">
  <div class="thread-head">
    <h4>Thread</h4>
    <p>Local discussion in craveit. Not posted to YouTube.</p>
  </div>

  <div class="composer">
    {#if replyTo}
      <div class="replying">Replying to {replyTo.authorHandle}</div>
    {/if}
    <textarea
      bind:value={draft}
      rows="3"
      maxlength="500"
      placeholder="Add a comment to the thread..."
    ></textarea>
    <div class="composer-row">
      <button class="ghost" onclick={() => (replyTo = null)} disabled={!replyTo}>Cancel Reply</button>
      <button class="primary" onclick={postComment} disabled={saving || !draft.trim()}>
        {saving ? 'Posting...' : 'Post'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="muted">Loading thread...</div>
  {:else}
    <div class="thread-list">
      {#each pinned as comment}
        <article class="comment pinned">
          <div class="comment-top">
            <strong>{comment.displayName}</strong>
            <span class="handle">{comment.authorHandle}</span>
            <span class="meta">Pinned</span>
            <span class="meta">{fmt(comment.createdAt)}</span>
          </div>
          <p>{comment.body}</p>
          <div class="comment-actions">
            <button class="link-btn" onclick={() => (replyTo = comment)}>Reply</button>
          </div>
        </article>
      {/each}

      {#each roots as comment}
        <article class="comment" class:official={comment.official}>
          <div class="comment-top">
            <strong>{comment.displayName}</strong>
            <span class="handle">{comment.authorHandle}</span>
            {#if comment.official}<span class="meta official-tag">Official</span>{/if}
            <span class="meta">{fmt(comment.createdAt)}</span>
          </div>
          <p>{comment.body}</p>
          <div class="comment-actions">
            <span class="meta">{comment.upvotes} helpful</span>
            <button class="link-btn" onclick={() => (replyTo = comment)}>Reply</button>
          </div>

          {#if repliesFor(comment.id).length > 0}
            <div class="replies">
              {#each repliesFor(comment.id) as reply}
                <article class="comment reply" class:official={reply.official}>
                  <div class="comment-top">
                    <strong>{reply.displayName}</strong>
                    <span class="handle">{reply.authorHandle}</span>
                    {#if reply.official}<span class="meta official-tag">Official</span>{/if}
                    <span class="meta">{fmt(reply.createdAt)}</span>
                  </div>
                  <p>{reply.body}</p>
                </article>
              {/each}
            </div>
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>

<style>
  .thread-wrap {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 12px;
    padding-top: 16px;
    display: grid;
    gap: 14px;
  }

  .thread-head h4 {
    margin: 0 0 4px;
    font-size: 16px;
  }

  .thread-head p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 12px;
  }

  .composer {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px;
    display: grid;
    gap: 8px;
  }

  textarea {
    width: 100%;
    min-width: 0;
    resize: vertical;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.2);
    color: var(--ink);
    padding: 10px;
    font: inherit;
  }

  .replying {
    font-size: 12px;
    color: var(--accent-2);
  }

  .composer-row {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .thread-list {
    display: grid;
    gap: 10px;
  }

  .comment {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px;
  }

  .comment.official {
    border-color: rgba(69, 242, 193, 0.5);
    background: rgba(69, 242, 193, 0.07);
  }

  .comment.pinned {
    border-color: rgba(255, 176, 56, 0.45);
    background: rgba(255, 176, 56, 0.08);
  }

  .comment-top {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .handle,
  .meta {
    color: var(--ink-soft);
  }

  .official-tag {
    color: var(--accent-2);
  }

  p {
    margin: 8px 0;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .comment-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .replies {
    margin-top: 8px;
    padding-left: 12px;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    display: grid;
    gap: 8px;
  }

  .reply {
    background: rgba(0, 0, 0, 0.15);
  }

  .link-btn {
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
    padding: 0;
    font: inherit;
  }

  .muted,
  .error {
    font-size: 12px;
  }

  .muted {
    color: var(--ink-soft);
  }

  .error {
    color: #ffb4b4;
  }
</style>
