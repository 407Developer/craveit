<script lang="ts">
  import { clearFilters } from '../stores.svelte';
</script>

<div class="state">
  <h3>No matches yet</h3>
  <p>Try expanding your topics or sources.</p>
  <button class="ghost" onclick={clearFilters}>Broaden Filters</button>
</div>

<style>
  .state {
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    padding: 24px;
    border-radius: var(--radius-md);
    text-align: center;
  }

  .ghost {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--ink);
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 13px;
    cursor: pointer;
  }
</style>
