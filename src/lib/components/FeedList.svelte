<script lang="ts">
  import { appState } from '../stores.svelte';
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
    <p>All sources, filtered to your specs.</p>
  </div>

  {#if filters}
    {@render filters()}
  {/if}

  {#if appState.error}
    <ErrorState />
  {:else if appState.loading}
    <div class="feed-list">
      {#each Array(3) as _}
        <SkeletonCard />
      {/each}
    </div>
  {:else if appState.feed.length === 0}
    <EmptyState />
  {:else}
    <div class="feed-list">
      {#each appState.feed as item, index}
        <FeedCard {item} {index} />
      {/each}
    </div>
  {/if}
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

  .feed-list {
    display: grid;
    gap: 14px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 860px) {
    .feed-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
