<script lang="ts">
  import { appState, loadMoreFeed } from '../stores.svelte';
  import FeedCard from './FeedCard.svelte';
  import SkeletonCard from './SkeletonCard.svelte';
  import EmptyState from './EmptyState.svelte';
  import ErrorState from './ErrorState.svelte';
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  let { filters } = $props<{ filters?: Snippet }>();

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
</script>

<div class="feed-container">
  <aside class="feed-sidebar">
    <div class="pulse-card">
      <div class="pulse-label">Daily Pulse</div>
      <div class="pulse-date">{today}</div>
      <div class="pulse-stats">
        <div class="stat">
          <strong>{appState.feed.length}</strong>
          <span>New items</span>
        </div>
        <div class="stat">
          <strong>{Array.from(appState.sources).length}</strong>
          <span>Active lanes</span>
        </div>
      </div>
    </div>

    <div class="mini-card">
      <h3>Quick Actions</h3>
      <div class="action-grid">
        <button class="action-item" onclick={() => appState.toggleFocusMode()}>
          <span class="icon">{appState.focusMode ? '🎯' : '👁️'}</span>
          <span>Focus</span>
        </button>
        <button class="action-item" onclick={() => appState.refreshFeed()}>
          <span class="icon">🔄</span>
          <span>Sync</span>
        </button>
      </div>
    </div>
  </aside>

  <section class="feed-main">
    {#if filters}
      <div class="filter-wrap">
        {@render filters()}
      </div>
    {/if}

    {#if appState.timeboxReached}
      <div class="caught-up" in:fade>
        <strong>Habit limit reached.</strong>
        <span>You've spent {appState.timeboxMinutes} minutes craving today. Come back tomorrow!</span>
      </div>
    {/if}

    {#if appState.error}
      <ErrorState message={appState.errorMessage} />
    {:else if appState.loading && appState.feed.length === 0}
      <div class="feed-grid">
        {#each Array(6) as _}
          <SkeletonCard />
        {/each}
      </div>
    {:else if appState.feed.length === 0}
      <EmptyState />
    {:else}
      <div class="feed-grid" class:dimmed={appState.timeboxReached}>
        {#each appState.feed as item, index}
          <FeedCard {item} {index} />
        {/each}
      </div>
      {#if appState.hasMore && !appState.timeboxReached}
        <div class="load-more-wrap">
          <button class="ghost" onclick={loadMoreFeed} disabled={appState.loading}>
            {appState.loading ? 'Syncing...' : 'Load More'}
          </button>
        </div>
      {/if}
    {/if}
  </section>
</div>

<style>
  .feed-container {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
    align-items: start;
  }

  @media (min-width: 1024px) {
    .feed-container {
      grid-template-columns: 280px 1fr;
    }
  }

  .feed-sidebar {
    display: none;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 80px;
  }

  @media (min-width: 1024px) {
    .feed-sidebar {
      display: flex;
    }
  }

  .pulse-card {
    background: var(--bg-soft);
    padding: 24px;
    border-radius: 24px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .pulse-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--accent-2);
    font-weight: 800;
    margin-bottom: 4px;
  }

  .pulse-date {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--ink);
  }

  .pulse-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat {
    display: grid;
    gap: 2px;
  }

  .stat strong {
    font-size: 20px;
    color: var(--accent);
  }

  .stat span {
    font-size: 11px;
    color: var(--ink-soft);
    text-transform: uppercase;
  }

  .mini-card {
    background: var(--bg-soft);
    padding: 20px;
    border-radius: 20px;
    box-shadow: var(--shadow);
  }

  .mini-card h3 {
    font-size: 14px;
    margin: 0 0 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ink-soft);
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .action-item {
    background: rgba(255, 255, 255, 0.05);
    border: 0;
    padding: 12px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .action-item .icon { font-size: 20px; }
  .action-item span:not(.icon) { font-size: 11px; color: var(--ink); font-weight: 600; }

  .feed-main {
    min-width: 0;
  }

  .filter-wrap {
    margin-bottom: 24px;
  }

  .feed-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .feed-grid.dimmed {
    opacity: 0.4;
    filter: grayscale(0.5);
    pointer-events: none;
  }

  .caught-up {
    background: rgba(255, 176, 56, 0.1);
    border: 1px solid rgba(255, 176, 56, 0.2);
    padding: 20px;
    border-radius: 20px;
    text-align: center;
    margin-bottom: 24px;
    display: grid;
    gap: 4px;
  }

  .caught-up strong { color: var(--accent); font-size: 18px; }
  .caught-up span { color: var(--ink-soft); font-size: 14px; }

  .load-more-wrap {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }

  @media (max-width: 480px) {
    .feed-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
