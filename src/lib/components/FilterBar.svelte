<script lang="ts">
  import {
    appState,
    toggleSource,
    setMedia,
    refreshFeed,
    clearFilters,
    toggleFocusMode,
    setSearchQuery,
    setRegion,
    setDateRange,
    setVideoLength,
    setIntent,
    setIncludeKeywords,
    setExcludeKeywords,
    setPulseMode
  } from '../stores.svelte';

  let { compact = false } = $props<{ compact?: boolean }>();
  let expanded = $state(false);
  let searchTimer: number | null = null;

  const sources = ['youtube', 'reddit', 'mastodon'];
  const mediaTypes = ['all', 'video', 'text'];
  const regions = [
    { code: 'global', label: 'Global' },
    { code: 'US', label: 'United States' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'IN', label: 'India' },
    { code: 'NG', label: 'Nigeria' }
  ];

  function applyAdvanced() {
    refreshFeed();
  }

  function keywordsToText(values: string[]) {
    return values.join(', ');
  }

  function handleSearchInput(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value;
    setSearchQuery(value);
    if (searchTimer && typeof window !== 'undefined') {
      window.clearTimeout(searchTimer);
    }
    if (typeof window !== 'undefined') {
      searchTimer = window.setTimeout(() => refreshFeed(), 350);
    }
  }

  $effect(() => {
    if (!compact) expanded = true;
  });
</script>

<div class="filters" class:compact>
  <div class="filter-group">
    <div class="filter-label">Intent</div>
    <div class="chip-row">
      <button class="chip" class:active={appState.intent === 'all'} onclick={() => setIntent('all')}>All</button>
      <button class="chip" class:active={appState.intent === 'educational'} onclick={() => setIntent('educational')}>Learn</button>
      <button class="chip" class:active={appState.intent === 'news'} onclick={() => setIntent('news')}>News</button>
      <button class="chip" class:active={appState.intent === 'entertainment'} onclick={() => setIntent('entertainment')}>Entertain</button>
    </div>
  </div>

  <div class="filter-group search-group">
    <div class="filter-label">Search</div>
    <input
      class="input"
      placeholder="Search topics or creators"
      value={appState.query}
      oninput={handleSearchInput}
      onkeydown={(e) => e.key === 'Enter' && applyAdvanced()}
    />
  </div>

  {#if compact}
    <div class="compact-actions">
      <button class="ghost" onclick={() => (expanded = !expanded)}>
        {expanded ? 'Hide filters' : 'More filters'}
      </button>
      <button class="ghost" onclick={applyAdvanced}>Apply</button>
      <a class="ghost" href="/settings">Settings</a>
    </div>
  {/if}

  {#if !compact || expanded}
    <div class="filter-group">
      <div class="filter-label">Sources</div>
      <div class="chip-row">
        {#each sources as source}
          <button
            class="chip"
            class:active={appState.sources.has(source)}
            onclick={() => toggleSource(source)}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </button>
        {/each}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-label">Media</div>
      <div class="chip-row">
        {#each mediaTypes as media}
          <button
            class="chip"
            class:active={appState.media === media}
            onclick={() => setMedia(media)}
          >
            {media.charAt(0).toUpperCase() + media.slice(1)}
          </button>
        {/each}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-label">Mode</div>
      <div class="action-row">
        <button class="primary" onclick={refreshFeed}>Refresh</button>
        <button class="ghost" onclick={clearFilters}>Clear</button>
        <button
          class="ghost"
          class:active={appState.focusMode}
          onclick={toggleFocusMode}
        >
          Focus {appState.focusMode ? 'On' : 'Off'}
        </button>
        <button class="ghost" class:active={appState.pulseMode} onclick={() => setPulseMode(!appState.pulseMode)}>
          Pulse {appState.pulseMode ? 'On' : 'Off'}
        </button>
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-label">Region + Duration</div>
      <div class="advanced-grid">
        <select class="input" value={appState.region} onchange={(e) => setRegion((e.currentTarget as HTMLSelectElement).value)}>
          {#each regions as region}
            <option value={region.code}>{region.label}</option>
          {/each}
        </select>
        <select
          class="input"
          value={appState.videoLength}
          onchange={(e) => setVideoLength((e.currentTarget as HTMLSelectElement).value as 'any' | 'short' | 'medium' | 'long')}
        >
          <option value="any">Any Length</option>
          <option value="short">Short (&lt; 4m)</option>
          <option value="medium">Medium (4-20m)</option>
          <option value="long">Long (&gt; 20m)</option>
        </select>
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-label">Date Range</div>
      <div class="advanced-grid">
        <input
          class="input"
          type="date"
          value={appState.dateFrom}
          onchange={(e) => setDateRange((e.currentTarget as HTMLInputElement).value, appState.dateTo)}
        />
        <input
          class="input"
          type="date"
          value={appState.dateTo}
          onchange={(e) => setDateRange(appState.dateFrom, (e.currentTarget as HTMLInputElement).value)}
        />
      </div>
      <button class="ghost apply-btn" onclick={applyAdvanced}>Apply</button>
    </div>
    <div class="filter-group">
      <div class="filter-label">Keyword Rules</div>
      <div class="advanced-grid keywords-grid">
        <input
          class="input"
          value={keywordsToText(appState.includeKeywords)}
          placeholder="Must include: ai, rust"
          oninput={(e) => setIncludeKeywords((e.currentTarget as HTMLInputElement).value)}
        />
        <input
          class="input"
          value={keywordsToText(appState.excludeKeywords)}
          placeholder="Block: politics, ads"
          oninput={(e) => setExcludeKeywords((e.currentTarget as HTMLInputElement).value)}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .filters {
    display: grid;
    gap: 14px;
    background: var(--bg-soft);
    border-radius: var(--radius-md);
    padding: 14px;
    border: 0;
    margin-bottom: 16px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .filters.compact {
    gap: 10px;
  }

  .filter-group {
    min-width: 0;
  }

  .filter-label {
    font-size: 12px;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .input {
    width: 100%;
    min-width: 0;
    background: rgba(12, 22, 21, 0.6);
    border-radius: 10px;
    border: 0;
    color: var(--ink);
    padding: 9px 10px;
    font-size: 13px;
  }

  :root.theme-light .input {
    background: rgba(0, 0, 0, 0.05);
  }

  .advanced-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .apply-btn {
    margin-top: 8px;
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
    border-color: transparent;
    box-shadow: 0 6px 12px rgba(255, 176, 56, 0.3);
  }

  .action-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .compact-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .primary,
  .ghost {
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .primary {
    background: linear-gradient(135deg, #ffb038, #45f2c1);
    color: #1b1303;
    font-weight: 600;
  }

  .ghost {
    background: rgba(255, 255, 255, 0.08);
    color: var(--ink);
    text-decoration: none;
    border: 0;
  }

  :root.theme-light .ghost {
    background: rgba(0, 0, 0, 0.05);
  }

  .ghost.active {
    background: rgba(69, 242, 193, 0.2);
    color: var(--accent-2);
  }

  @media (min-width: 720px) {
    .filters {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .advanced-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
