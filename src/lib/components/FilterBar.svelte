<script lang="ts">
  import { appState, toggleSource, setMedia, refreshFeed, clearFilters, toggleFocusMode } from '../stores.svelte';

  const sources = ['youtube', 'reddit'];
  const mediaTypes = ['all', 'video', 'text'];
</script>

<div class="filters">
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
    <div class="filter-label">Options</div>
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
    </div>
  </div>
</div>

<style>
  .filters {
    display: grid;
    gap: 14px;
    background: rgba(12, 22, 21, 0.6);
    border-radius: var(--radius-md);
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 16px;
    overflow: hidden;
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

  .chip {
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: var(--ink);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
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
    background: transparent;
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--ink);
  }

  .ghost.active {
    background: rgba(69, 242, 193, 0.2);
    border-color: var(--accent-2);
  }

  @media (min-width: 720px) {
    .filters {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
