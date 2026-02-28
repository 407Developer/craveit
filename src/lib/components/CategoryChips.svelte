<script lang="ts">
  import { appState, toggleCategory } from '../stores.svelte';

  const allCategories = ['tech', 'hobby project', 'tech updates', 'politics'];
</script>

<section class="panel">
  <div class="panel-head">
    <h2>Choose Your Lanes</h2>
    <p>Select the topics you want to see.</p>
  </div>
  <div class="chip-row">
    {#each allCategories as tag}
      <button 
        class="chip" 
        class:active={appState.categories.has(tag)}
        onclick={() => toggleCategory(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
</section>

<style>
  .panel {
    background: rgba(13, 34, 30, 0.9);
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

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
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

  .chip.active {
    background: var(--accent);
    color: #1a1002;
    border-color: transparent;
    box-shadow: 0 6px 12px rgba(255, 176, 56, 0.3);
  }
</style>
