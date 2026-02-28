<script lang="ts">
  import type { FeedItem } from '../types';
  import { openFeedItem } from '../stores.svelte';

  let { item, index } = $props<{ item: FeedItem, index: number }>();

  function openDetail() {
    openFeedItem(item, false);
  }

  function openThread(e: MouseEvent) {
    e.stopPropagation();
    openFeedItem(item, true);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function fallbackThumbnail(event: Event) {
    const image = event.currentTarget as HTMLImageElement;
    image.src = '/assets/icon.svg';
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
      loading={index < 6 ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={index < 2 ? 'high' : 'low'}
      onerror={fallbackThumbnail}
    />
    <div class="media-tag">{item.mediaType}</div>
  </div>
  
  <div class="feed-content">
    <div class="feed-meta">
      <span class="source-tag">{item.source}</span>
      <span class="dot">·</span>
      <span>{formatDate(item.createdAt)}</span>
    </div>
    
    <h3 class="feed-title">{item.title}</h3>
    <p class="feed-summary">{item.summary}</p>
    
    <div class="feed-footer">
      <div class="tag-row">
        {#each item.topicTags.slice(0, 2) as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
      
      <div class="card-actions">
        <span class="read-time">
          {#if item.mediaType === 'text' && item.readTimeMinutes}
            {item.readTimeMinutes}m
          {:else}
            {item.durationLabel ?? 'video'}
          {/if}
        </span>
        <button class="thread-icon-btn" onclick={openThread} aria-label="Open comments">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</article>

<style>
  .feed-card {
    background: var(--bg-soft);
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    cursor: pointer;
    box-shadow: var(--shadow);
  }

  :root.theme-light .feed-card {
    border-color: rgba(0, 0, 0, 0.05);
  }

  .feed-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: var(--accent-2);
  }

  .feed-media {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  :root:not(.theme-light) .feed-media {
    background: rgba(0, 0, 0, 0.35);
  }

  .feed-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .feed-card:hover .feed-media img {
    transform: scale(1.05);
  }

  .media-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    color: #fff;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .feed-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .feed-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ink-soft);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .source-tag {
    color: var(--accent-2);
  }

  .feed-title {
    font-size: 19px;
    margin: 0 0 10px;
    line-height: 1.3;
    font-weight: 700;
    color: var(--ink);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .feed-summary {
    margin: 0 0 20px;
    color: var(--ink-soft);
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .feed-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag-row {
    display: flex;
    gap: 6px;
  }

  .tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(69, 242, 193, 0.1);
    color: var(--accent-2);
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .read-time {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .thread-icon-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--ink);
  }

  :root.theme-light .thread-icon-btn {
    background: rgba(0, 0, 0, 0.05);
  }

  .thread-icon-btn:hover {
    background: var(--accent);
    color: #1b1303;
    transform: scale(1.1);
  }

  .thread-icon-btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
