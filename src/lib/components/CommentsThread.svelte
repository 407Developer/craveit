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
  let handle = $state('@you');
  let displayName = $state('You');

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
        authorHandle: handle,
        displayName
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

  $effect(() => {
    if (typeof window === 'undefined') return;
    const savedHandle = window.localStorage.getItem('craveit:handle');
    const savedName = window.localStorage.getItem('craveit:displayName');
    if (savedHandle) handle = savedHandle;
    if (savedName) displayName = savedName;
  });

  function saveIdentity() {
    const normalized = handle.startsWith('@') ? handle : `@${handle}`;
    handle = normalized.toLowerCase().replace(/[^a-z0-9_@]/g, '').slice(0, 20) || '@you';
    if (handle === '@cravit' || handle === '@crave') handle = '@you';
    displayName = displayName.trim().slice(0, 30) || 'You';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('craveit:handle', handle);
      window.localStorage.setItem('craveit:displayName', displayName);
    }
  }

  function renderMarkdown(input: string) {
    const escaped = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const withLinks = escaped.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href=\"$2\" target=\"_blank\" rel=\"noreferrer\">$1</a>'
    );

    return withLinks
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  }
</script>

<section class="thread-wrap">
  <div class="thread-head">
    <h4>Thread</h4>
    <p>Local discussion in craveit. Not posted to YouTube.</p>
  </div>

  <div class="composer">
    <div class="identity-row">
      <input class="identity-input" bind:value={displayName} placeholder="Display name" />
      <input class="identity-input" bind:value={handle} placeholder="@handle" />
      <button class="ghost" onclick={saveIdentity}>Save</button>
    </div>
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
          <div class="comment-body">{@html renderMarkdown(comment.body)}</div>
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
          <div class="comment-body">{@html renderMarkdown(comment.body)}</div>
          <div class="comment-actions">
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
                  <div class="comment-body">{@html renderMarkdown(reply.body)}</div>
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
    border-top: 0;
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
    border: 0;
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
    border: 0;
    background: rgba(0, 0, 0, 0.2);
    color: var(--ink);
    padding: 10px;
    font: inherit;
  }

  .identity-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
  }

  .identity-input {
    width: 100%;
    min-width: 0;
    border-radius: 10px;
    border: 0;
    background: rgba(0, 0, 0, 0.2);
    color: var(--ink);
    padding: 8px 10px;
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
    border: 0;
    border-radius: 12px;
    padding: 10px;
  }

  .comment.official {
    background: rgba(69, 242, 193, 0.07);
  }

  .comment.pinned {
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

  .comment-body {
    margin: 8px 0;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .comment-body :global(a) {
    color: var(--accent);
  }

  .comment-body :global(code) {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 12px;
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

  @media (max-width: 560px) {
    .identity-row {
      grid-template-columns: 1fr;
    }
  }
</style>
