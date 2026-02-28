<script lang="ts">
  import { fade } from 'svelte/transition';

  let { article, loading, error } = $props<{
    article: { title: string; content: string; html: string; byline: string; siteName: string } | null;
    loading: boolean;
    error: string | null;
  }>();

  function formatContent(text: string) {
    if (!text) return '';
    // Basic paragraph separation for plain text if HTML isn't great
    return text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
  }
</script>

<div class="reader-container">
  {#if loading}
    <div class="reader-skeleton" in:fade>
      <div class="skeleton-line title"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>
  {:else if error}
    <div class="reader-error" in:fade>
      <p>We couldn't extract the full text for this one.</p>
      <small>{error}</small>
    </div>
  {:else if article}
    <article class="prose" in:fade>
      {#if article.siteName || article.byline}
        <div class="article-meta">
          {article.siteName || ''} {article.byline ? `· ${article.byline}` : ''}
        </div>
      {/if}
      
      <!-- Prefer sanitized HTML from Readability, but fallback to content if needed -->
      <div class="article-body">
        {@html article.html || formatContent(article.content)}
      </div>
    </article>
  {/if}
</div>

<style>
  .reader-container {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .prose {
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.7;
    color: #e0f2f1;
    font-size: 16px;
  }

  .article-meta {
    font-size: 13px;
    color: var(--ink-soft);
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .article-body :global(p) {
    margin-bottom: 1.5em;
  }

  .article-body :global(h1),
  .article-body :global(h2),
  .article-body :global(h3) {
    margin: 1.5em 0 0.5em;
    color: #fff;
  }

  .article-body :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5em 0;
  }

  .article-body :global(a) {
    color: var(--accent);
    text-decoration: underline;
  }

  .reader-skeleton {
    display: grid;
    gap: 12px;
  }

  .skeleton-line {
    height: 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    width: 100%;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-line.title { height: 24px; width: 80%; margin-bottom: 12px; }
  .skeleton-line.short { width: 60%; }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  .reader-error {
    padding: 20px;
    background: rgba(255, 100, 100, 0.05);
    border-radius: 12px;
    text-align: center;
    color: var(--ink-soft);
  }
</style>
