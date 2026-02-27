<script lang="ts">
  import { appState } from '../stores.svelte';

  let item = $derived(appState.selectedItem);

  function close() {
    appState.selectedItem = null;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        {:else}
          <img src={item.thumbnailUrl} alt={item.title} />
        {/if}
      </div>
      <div class="detail-body">
        <div class="detail-meta">
          {item.source.toUpperCase()} · {item.author} · {formatDate(item.createdAt)}
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        {#if !appState.focusMode}
          <a class="detail-link" href={item.url} target="_blank" rel="noreferrer">Open Source</a>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .detail {
    position: fixed;
    inset: 0;
    background: rgba(4, 10, 9, 0.7);
    display: none;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    z-index: 10;
    overflow: auto;
  }

  .detail.active {
    display: flex;
  }

  .detail-card {
    width: 100%;
    max-width: 520px;
    max-height: calc(100dvh - 32px);
    background: var(--bg-soft);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: slideUp 0.35s ease;
    position: relative;
  }

  .detail-media {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
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
  }

  .detail-meta {
    color: var(--ink-soft);
    font-size: 12px;
    margin-bottom: 8px;
  }

  .detail-link {
    display: inline-flex;
    margin-top: 14px;
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
  }

  .detail-close {
    position: absolute;
    right: 20px;
    top: 14px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    border: 0;
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
    z-index: 1;
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
