<script lang="ts">
  import { appState, loadMoreFeed } from '../stores.svelte';
  import FeedCard from './FeedCard.svelte';
  import SkeletonCard from './SkeletonCard.svelte';
  import EmptyState from './EmptyState.svelte';
  import ErrorState from './ErrorState.svelte';
  import type { Snippet } from 'svelte';

  let { filters } = $props<{ filters?: Snippet }>();
</script>

<section class="panel">
  <div class="panel-head">
    <h2>Your Feed</h2>
    <p>All sources, filtered to your specs. Tap a card to open thread + comments.</p>
  </div>

  {#if filters}
    {@render filters()}
  {/if}

  {#if appState.timeboxReached}
    <div class="caught-up">
      <strong>You're all caught up on your cravings for today.</strong>
      <span>Daily limit hit. Come back tomorrow or raise limit in Settings.</span>
    </div>
  {/if}

  {#if appState.error}
    <ErrorState message={appState.errorMessage} />
  {:else if appState.loading}
    <div class="feed-list">
      {#each Array(3) as _}
        <SkeletonCard />
      {/each}
    </div>
  {:else if appState.feed.length === 0}
    <EmptyState />
  {:else}
    <div class="feed-list" class:dimmed={appState.timeboxReached}>
      {#each appState.feed as item, index}
        <FeedCard {item} {index} />
      {/each}
    </div>
    {#if appState.hasMore && !appState.timeboxReached}
      <div class="load-more-wrap">
        <button class="ghost" onclick={loadMoreFeed} disabled={appState.loading}>Load More</button>
      </div>
    {/if}
  {/if}
</section>

<style>
  .panel {
    background: var(--bg-soft);
    border: 0;
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

  .feed-list {
    display: grid;
    gap: 14px;
    grid-template-columns: 1fr;
  }

  .feed-list.dimmed {
    opacity: 0.45;
    filter: grayscale(0.2);
    pointer-events: none;
  }

  .caught-up {
    display: grid;
    gap: 6px;
    background: rgba(255, 176, 56, 0.12);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
  }

  .caught-up span {
    color: var(--ink-soft);
    font-size: 13px;
  }

  .load-more-wrap {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  @media (min-width: 860px) {
    .feed-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
