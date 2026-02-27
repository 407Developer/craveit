<script lang="ts">
  import { onMount } from 'svelte';
  import { addSource, getSources, removeSource, resolveSource } from '../api';

  const categories = ['tech', 'hobby project', 'tech updates', 'politics'];

  let sources: any[] = $state([]);
  let error = $state('');
  let loading = $state(false);
  let kind = $state<'youtube_channel' | 'youtube_playlist' | 'reddit_subreddit' | 'website_rss'>('youtube_channel');
  let input = $state('');
  let title = $state('');
  let selectedTags = $state<string[]>([]);

  onMount(async () => {
    await refreshSources();
  });

  async function refreshSources() {
    const data = await getSources();
    sources = data.connected ?? [];
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      selectedTags = [...selectedTags, tag];
    }
  }

  async function handleAdd() {
    error = '';
    if (!input.trim()) {
      error = 'Type something first.';
      return;
    }

    loading = true;
    try {
      const resolved = await resolveSource({ kind, input: input.trim() });
      const sourceType = kind.startsWith('youtube')
        ? 'youtube'
        : kind.startsWith('reddit')
          ? 'reddit'
          : 'web';

      const friendlyTitle = title.trim() || input.trim();

      await addSource({
        title: friendlyTitle,
        url: resolved.url,
        source: sourceType,
        topicTags: selectedTags
      });

      input = '';
      title = '';
      selectedTags = [];
      await refreshSources();
    } catch (e: any) {
      error = e?.message ?? 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  async function handleRemove(id: string) {
    error = '';
    try {
      await removeSource(id);
      await refreshSources();
    } catch (e: any) {
      error = e?.message ?? 'Could not remove source.';
    }
  }
</script>

<section class="panel" id="source-manager">
  <div class="panel-head">
    <h2>Add What You Want</h2>
    <p>Paste a link or a name and I will build the feed for you.</p>
  </div>

  <div class="add-grid">
    <label class="field">
      <span>Pick type</span>
      <select bind:value={kind}>
        <option value="youtube_channel">YouTube channel link</option>
        <option value="youtube_playlist">YouTube playlist link</option>
        <option value="reddit_subreddit">Reddit subreddit (r/name)</option>
        <option value="website_rss">Website RSS link</option>
      </select>
    </label>

    <label class="field">
      <span>Paste here</span>
      <input
        type="text"
        placeholder="Example: https://www.youtube.com/@mkbhd"
        bind:value={input}
      />
    </label>

    <label class="field">
      <span>Give it a name (optional)</span>
      <input type="text" placeholder="Example: MKBHD" bind:value={title} />
    </label>
  </div>

  <div class="chip-row">
    {#each categories as tag}
      <button class="chip" class:active={selectedTags.includes(tag)} onclick={() => toggleTag(tag)}>
        {tag}
      </button>
    {/each}
  </div>

  <div class="action-row">
    <button class="primary" onclick={handleAdd} disabled={loading}>
      {loading ? 'Adding...' : 'Add feed'}
    </button>
    {#if error}
      <span class="error-text">{error}</span>
    {/if}
  </div>

  <div class="source-list">
    <h3>Saved feeds</h3>
    {#if sources.length === 0}
      <p class="muted">No feeds added yet.</p>
    {:else}
      {#each sources as source}
        <div class="saved-row">
          <div>
            <div class="saved-title">{source.title}</div>
            <div class="saved-sub">{source.url}</div>
          </div>
          <button class="ghost" onclick={() => handleRemove(source.id)}>Remove</button>
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .panel {
    background: rgba(13, 34, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
    overflow: hidden;
  }

  .panel-head h2 {
    margin: 0 0 6px;
    font-size: 20px;
  }

  .panel-head p {
    margin: 0 0 16px;
    color: var(--ink-soft);
    font-size: 14px;
  }

  .add-grid {
    display: grid;
    gap: 12px;
  }

  .field {
    display: grid;
    gap: 6px;
    font-size: 12px;
    color: var(--ink-soft);
    min-width: 0;
  }

  select,
  input {
    background: rgba(12, 22, 21, 0.6);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--ink);
    padding: 10px 12px;
    font-size: 14px;
    width: 100%;
    min-width: 0;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .chip {
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: var(--ink);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chip.active {
    background: var(--accent);
    color: #1a1002;
    border-color: transparent;
    box-shadow: 0 6px 12px rgba(255, 176, 56, 0.3);
  }

  .action-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primary,
  .ghost {
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .primary {
    background: linear-gradient(135deg, #ffb038, #45f2c1);
    color: #1b1303;
    font-weight: 600;
  }

  .ghost {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--ink);
  }

  .error-text {
    color: #ffb4b4;
    font-size: 12px;
  }

  .source-list {
    margin-top: 18px;
  }

  .source-list h3 {
    margin: 0 0 12px;
    font-size: 16px;
  }

  .saved-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .saved-row > div {
    min-width: 0;
  }

  .saved-title {
    font-weight: 600;
  }

  .saved-sub {
    font-size: 12px;
    color: var(--ink-soft);
    word-break: break-all;
  }

  .muted {
    color: var(--ink-soft);
    font-size: 12px;
  }

  @media (min-width: 720px) {
    .add-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
