<script lang="ts">
  import type { FeedItem } from '../types';
  import { appState } from '../stores.svelte';

  let { item, index } = $props<{ item: FeedItem, index: number }>();

  function openDetail() {
    appState.selectedItem = item;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<article
  class="feed-card"
  style="animation: fadeIn 0.3s ease {index * 0.05}s forwards"
  onclick={openDetail}
>
  <div class="feed-media">
    <img
      src={item.thumbnailUrl}
      alt={item.title}
      loading={index < 2 ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={index < 2 ? 'high' : 'low'}
      referrerpolicy="no-referrer"
    />
    <div class="media-tag">{item.mediaType}</div>
  </div>
  <div class="feed-meta">
    <span>{item.source.toUpperCase()} · {formatDate(item.createdAt)}</span>
    <span>{item.score ?? 0} score</span>
  </div>
  <h3 class="feed-title">{item.title}</h3>
  <p class="feed-summary">{item.summary}</p>
  <div class="tag-row">
    {#each item.topicTags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
  <div class="open-thread">Tap To Open Thread</div>
</article>

<style>
  .feed-card {
    background: var(--card);
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: grid;
    gap: 12px;
    padding: 14px;
    transition: transform 0.2s ease, border 0.2s ease, box-shadow 0.2s ease;
    opacity: 0;
    min-width: 0;
    cursor: pointer;
  }

  .feed-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 24px rgba(2, 8, 7, 0.28);
  }

  .feed-media {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-sm);
    background: rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  .feed-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .media-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .feed-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--ink-soft);
    font-size: 12px;
  }

  .feed-title {
    font-family: "Newsreader", serif;
    font-size: 18px;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .feed-summary {
    margin: 0;
    color: var(--ink-soft);
    font-size: 13px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .tag-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(69, 242, 193, 0.12);
    color: var(--accent-2);
  }

  .open-thread {
    justify-self: start;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: var(--ink);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
  }

  .open-thread:hover {
    border-color: rgba(69, 242, 193, 0.55);
    color: var(--accent-2);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
