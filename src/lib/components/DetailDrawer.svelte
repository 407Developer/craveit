<script lang="ts">
  import { appState, closeFeedItem } from '../stores.svelte';
  import CommentsThread from '$lib/components/CommentsThread.svelte';
  import ArticleReader from '$lib/components/ArticleReader.svelte';
  import { onMount, tick } from 'svelte';

  let item = $derived(appState.selectedItem);
  let threadRef = $state<HTMLDivElement | null>(null);

  // Reader state
  let article = $state<{ title: string; content: string; html: string; byline: string; siteName: string } | null>(null);
  let readerLoading = $state(false);
  let readerError = $state<string | null>(null);

  // AI interaction mock
  let aiMessage = $state('');
  let isTyping = $state(false);

  async function fetchReaderMode(url: string) {
    if (!url || item?.mediaType !== 'text') return;
    readerLoading = true;
    readerError = null;
    article = null;
    try {
      const res = await fetch(`/api/reader?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.article) {
        article = data.article;
      } else {
        readerError = data.error || 'Failed to extract content';
      }
    } catch (e: any) {
      readerError = e.message;
    } finally {
      readerLoading = false;
    }
  }

  function askAi() {
    if (isTyping) return;
    isTyping = true;
    aiMessage = '';
    const fullMessage = "Based on the content, this article explores the intersection of high-agency design and distraction-free environments. The key takeaway is that by reducing cognitive load, users can focus on meaningful work rather than fighting the interface.";
    let i = 0;
    const interval = setInterval(() => {
      aiMessage += fullMessage[i];
      i++;
      if (i >= fullMessage.length) {
        clearInterval(interval);
        isTyping = false;
      }
    }, 20);
  }

  $effect(() => {
    if (item?.url && item.mediaType === 'text') {
      fetchReaderMode(item.url);
    } else {
      article = null;
      readerError = null;
      aiMessage = '';
    }

    if (item && appState.openToComments) {
      tick().then(() => {
        threadRef?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });

  function close() {
    closeFeedItem();
    aiMessage = '';
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
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = Math.abs(touch.clientY - touchStartY);
    if (deltaX > 80 && deltaY < 70) {
      close();
    }
  }

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
  <div
    class="detail active"
    onclick={(e) => e.target === e.currentTarget && close()}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    <div class="detail-card">
      <button class="detail-back" onclick={close} aria-label="Back">←</button>
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
        <div class="detail-header">
          <div class="detail-meta">
            {item.source} · {item.author} · {formatDate(item.createdAt)}
          </div>
          <h3>{item.title}</h3>
          
          <div class="quick-actions">
            <button class="action-btn ai" onclick={askAi} disabled={isTyping}>
              {isTyping ? 'Thinking...' : '✨ Ask AI'}
            </button>
            {#if !appState.focusMode}
              <a class="action-btn link" href={item.url} target="_blank" rel="noreferrer">Source</a>
            {/if}
          </div>
        </div>

        {#if aiMessage}
          <div class="ai-response">
            <strong>Cravit AI:</strong>
            <p>{aiMessage}</p>
          </div>
        {/if}

        {#if item.mediaType === 'text'}
          <ArticleReader {article} loading={readerLoading} error={readerError} />
        {:else}
          <p class="simple-summary">{item.summary}</p>
        {/if}

        <div class="thread-section" bind:this={threadRef}>
          <div class="thread-title">Community Thread</div>
          <CommentsThread itemId={item.id} />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .detail {
    position: fixed;
    inset: 0;
    background: rgba(4, 10, 9, 0.7);
    backdrop-filter: blur(12px);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 100;
  }

  :root.theme-light .detail {
    background: rgba(220, 240, 235, 0.6);
  }

  .detail.active {
    display: flex;
  }

  .detail-card {
    width: min(1000px, 100%);
    height: min(900px, calc(100dvh - 40px));
    background: var(--bg-soft);
    border-radius: 24px;
    box-shadow: var(--shadow);
    overflow: hidden;
    animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  @keyframes zoomIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .detail-media {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    max-height: 40dvh;
  }

  .detail-media iframe,
  .detail-media img {
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
  }

  .detail-body {
    padding: 32px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
    background: var(--bg-soft);
  }

  .detail-header {
    margin-bottom: 24px;
  }

  .detail-meta {
    color: var(--ink-soft);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 28px;
    margin: 0 0 20px;
    line-height: 1.2;
    font-weight: 800;
    color: var(--ink);
  }

  .quick-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 0;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .action-btn.ai {
    background: linear-gradient(135deg, #45f2c1 0%, #2ecc71 100%);
    color: #051410;
  }

  .action-btn.ai:disabled {
    opacity: 0.7;
    cursor: default;
  }

  .action-btn.link {
    background: rgba(255,255,255,0.08);
    color: var(--ink);
  }

  :root.theme-light .action-btn.link {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .ai-response {
    background: rgba(69, 242, 193, 0.08);
    border-left: 4px solid #45f2c1;
    padding: 20px;
    border-radius: 0 16px 16px 0;
    margin-bottom: 24px;
    font-size: 15px;
    line-height: 1.6;
  }

  .ai-response strong {
    color: #2ecc71;
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    text-transform: uppercase;
  }

  .ai-response p {
    margin: 0;
    color: var(--ink);
  }

  .simple-summary {
    font-size: 18px;
    line-height: 1.6;
    color: var(--ink-soft);
    margin-bottom: 32px;
  }

  .thread-section {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 2px solid rgba(255, 255, 255, 0.05);
  }

  :root.theme-light .thread-section {
    border-top-color: rgba(0, 0, 0, 0.05);
  }

  .thread-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 24px;
  }

  .detail-back {
    position: absolute;
    left: 20px;
    top: 20px;
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: 0;
    cursor: pointer;
    z-index: 10;
    font-size: 24px;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .detail-close {
    position: absolute;
    right: 20px;
    top: 20px;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    border: 0;
    padding: 8px 16px;
    border-radius: 999px;
    cursor: pointer;
    z-index: 10;
    font-weight: 600;
    font-size: 13px;
    backdrop-filter: blur(4px);
  }

  @media (min-width: 900px) {
    .detail-card {
      grid-template-columns: 1.1fr 0.9fr;
      grid-template-rows: 1fr;
    }

    .detail-media {
      height: 100%;
      max-height: none;
      aspect-ratio: auto;
    }
  }

  @media (max-width: 600px) {
    .detail { padding: 0; }
    .detail-card { height: 100dvh; border-radius: 0; }
    .detail-body { padding: 20px; }
    h3 { font-size: 22px; }
  }
</style>
