<script lang="ts">
  import { setCategories } from '../stores.svelte';

  const cravings = [
    'tech',
    'tech updates',
    'hobby project',
    'politics',
    'design systems',
    'indie hacking',
    'ai research',
    'product strategy'
  ];

  let picked = $state<string[]>(['tech', 'tech updates', 'hobby project']);

  function toggleCraving(tag: string) {
    if (picked.includes(tag)) {
      picked = picked.filter((entry) => entry !== tag);
      return;
    }
    if (picked.length >= 3) return;
    picked = [...picked, tag];
  }

  function applyCravings() {
    if (picked.length === 0) return;
    setCategories(picked);
  }
</script>

<section class="panel" id="onboarding">
  <div class="panel-head">
    <h2>What Are Your 3 Core Cravings Right Now?</h2>
    <p>Pick up to 3. This drives your intent-first feed.</p>
  </div>

  <div class="chip-row">
    {#each cravings as tag}
      <button class="chip" class:active={picked.includes(tag)} onclick={() => toggleCraving(tag)}>
        {tag}
      </button>
    {/each}
  </div>

  <div class="foot-row">
    <span>{picked.length}/3 selected</span>
    <button class="primary" onclick={applyCravings}>Apply cravings</button>
  </div>
</section>

<style>
  .panel {
    background: rgba(13, 34, 30, 0.82);
    border: 0;
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
    overflow: hidden;
  }

  .panel-head h2 {
    margin: 0 0 6px;
    font-size: 19px;
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
    box-shadow: 0 6px 12px rgba(255, 176, 56, 0.3);
  }

  .foot-row {
    margin-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    color: var(--ink-soft);
    font-size: 12px;
  }
</style>
