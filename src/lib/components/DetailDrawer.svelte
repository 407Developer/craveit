<script lang="ts">
import { appState } from '../stores.svelte';
  import CommentsThread from '$lib/components/CommentsThread.svelte';

  let item = $derived(appState.selectedItem);

  function close() {
    appState.selectedItem = null;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function parseVideoId(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1) || null;
      }
      return parsed.searchParams.get('v');
    } catch {
      return null;
    }
  }

  let videoId = $derived(item?.url ? parseVideoId(item.url) : null);

  $effect(() => {
    if (typeof document === 'undefined') return;
    const hasItem = Boolean(item);
    document.body.style.overflow = hasItem ? 'hidden' : '';
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    if (hasItem) {
      window.addEventListener('keydown', keyHandler);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', keyHandler);
    };
  });
</script>

{#if item}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="detail active" onclick={(e) => e.target === e.currentTarget && close()}>
    <div class="detail-card">
      <button class="detail-close" onclick={close}>Close</button>

      <div class="detail-media">
        {#if item.mediaType === 'video' && videoId}
          <iframe
            src="https://www.youtube.com/embed/{videoId}"
            title={item.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        {:else}
          <img src={item.thumbnailUrl} alt={item.title} loading="lazy" decoding="async" />
        {/if}
      </div>

      <div class="detail-body">
        <div class="detail-meta">
          {item.source.toUpperCase()} · {item.author} · {formatDate(item.createdAt)}
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>

        <div class="quick-actions">
          <button class="ghost">Ask @cravit</button>
          <button class="ghost">Key Takeaway</button>
          {#if !appState.focusMode}
            <a class="detail-link" href={item.url} target="_blank" rel="noreferrer">Open Source</a>
          {/if}
        </div>

        <div class="thread-title">Comments & Thread</div>
        <CommentsThread itemId={item.id} />
      </div>
    </div>
  </div>
{/if}

<style>
  .detail {
    position: fixed;
    inset: 0;
    background: rgba(4, 10, 9, 0.75);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 10px;
    z-index: 30;
    overflow: auto;
  }

  .detail.active {
    display: flex;
  }

  .detail-card {
    width: min(980px, 100%);
    max-height: calc(100dvh - 20px);
    background: var(--bg-soft);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: slideUp 0.25s ease;
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .detail-media {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    max-height: min(38dvh, 320px);
  }

  .detail-media iframe,
  .detail-media img {
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
  }

  .detail-body {
    padding: 18px;
    overflow: auto;
    min-height: 0;
    overscroll-behavior: contain;
  }

  .detail-meta {
    color: var(--ink-soft);
    font-size: 12px;
    margin-bottom: 8px;
  }

  h3 {
    margin: 0 0 10px;
    overflow-wrap: anywhere;
  }

  p {
    margin: 0;
    color: var(--ink-soft);
    overflow-wrap: anywhere;
  }

  .quick-actions {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .thread-title {
    margin-top: 16px;
    font-size: 13px;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.9px;
  }

  .detail-link,
  .ghost {
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    text-decoration: none;
  }

  .detail-link {
    background: linear-gradient(135deg, #ffb038, #45f2c1);
    color: #1b1303;
    font-weight: 700;
  }

  .ghost {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: var(--ink);
  }

  .detail-close {
    position: absolute;
    right: 14px;
    top: 14px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border: 0;
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
    z-index: 1;
  }

  @media (min-width: 900px) {
    .detail-card {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-rows: none;
      height: min(780px, calc(100dvh - 20px));
    }

    .detail-media {
      aspect-ratio: auto;
      height: 100%;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(16px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
