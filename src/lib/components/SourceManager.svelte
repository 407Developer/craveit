<script lang="ts">
  import { onMount } from 'svelte';
  import { addSource, getSources, removeSource, resolveSource, updateSourceWeight } from '../api';
  import { appState, togglePausedSource } from '../stores.svelte';

  const categories = ['tech', 'hobby project', 'tech updates', 'politics'];

  let sources: any[] = $state([]);
  let error = $state('');
  let loading = $state(false);
  let kind = $state<
    | 'youtube_channel'
    | 'youtube_playlist'
    | 'reddit_subreddit'
    | 'website_rss'
    | 'mastodon_account'
    | 'mastodon_hashtag'
  >('youtube_channel');
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
          : kind.startsWith('mastodon')
            ? 'mastodon'
            : 'web';

      const friendlyTitle = title.trim() || input.trim();

      await addSource({
        title: friendlyTitle,
        url: resolved.url,
        source: sourceType,
        topicTags: selectedTags,
        weight: 100
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

  async function handleWeightChange(id: string, value: number) {
    try {
      await updateSourceWeight(id, value);
      sources = sources.map((source) => (source.id === id ? { ...source, weight: value } : source));
    } catch (e: any) {
      error = e?.message ?? 'Could not update weighting.';
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
        <option value="mastodon_account">Mastodon account</option>
        <option value="mastodon_hashtag">Mastodon hashtag</option>
        <option value="website_rss">Website RSS link</option>
      </select>
    </label>

    <label class="field">
      <span>Paste here</span>
      <input
        type="text"
        placeholder="Example: https://www.youtube.com/@mkbhd or @user@mastodon.social"
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
            <div class="weight-row">
              <label for={`weight-${source.id}`}>Weight {source.weight ?? 100}%</label>
              <input
                id={`weight-${source.id}`}
                type="range"
                min="0"
                max="100"
                value={source.weight ?? 100}
                oninput={(e) => handleWeightChange(source.id, Number((e.currentTarget as HTMLInputElement).value))}
              />
            </div>
          </div>
          <div class="row-actions">
            <button
              class="ghost"
              class:active={appState.pausedSourceIds.has(source.id)}
              onclick={() => togglePausedSource(source.id)}
            >
              {appState.pausedSourceIds.has(source.id) ? 'Paused' : 'Keep'}
            </button>
            <button class="ghost" onclick={() => handleRemove(source.id)}>Remove</button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .panel {
    background: var(--bg-soft);
    border: 0;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(12px);
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
    border: 0;
    color: var(--ink);
    padding: 10px 12px;
    font-size: 14px;
    width: 100%;
    min-width: 0;
  }

  :root.theme-light select,
  :root.theme-light input {
    background: rgba(0, 0, 0, 0.05);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .chip {
    border: 0;
    background: rgba(255, 255, 255, 0.08);
    color: var(--ink);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :root.theme-light .chip {
    background: rgba(0, 0, 0, 0.05);
  }

  .chip.active {
    background: var(--accent);
    color: #1a1002;
    box-shadow: 0 6px 12px rgba(255, 176, 56, 0.3);
  }

  .action-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
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
  }

  .saved-row + .saved-row {
    margin-top: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  :root.theme-light .saved-row + .saved-row {
    border-top-color: rgba(0, 0, 0, 0.05);
  }

  .saved-row > div {
    min-width: 0;
    width: 100%;
  }

  .saved-title {
    font-weight: 600;
  }

  .saved-sub {
    font-size: 12px;
    color: var(--ink-soft);
    word-break: break-all;
  }

  .weight-row {
    margin-top: 8px;
    display: grid;
    gap: 6px;
  }

  .weight-row label {
    font-size: 12px;
    color: var(--ink-soft);
  }

  .row-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .ghost.active {
    background: rgba(255, 176, 56, 0.2);
    border-color: rgba(255, 176, 56, 0.4);
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
