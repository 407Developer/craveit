<script lang="ts">
  import { refreshFeed } from '../stores.svelte';

  let { message } = $props<{ message?: string }>();
</script>

<div class="state state-error">
  <h3>Something went sideways</h3>
  <p>{message ?? "We couldn't load your feed. Check your connection or try again."}</p>
  <button class="primary" onclick={refreshFeed}>Try Again</button>
</div>

<style>
  .state {
    background: rgba(255, 255, 255, 0.05);
    border: 0;
    padding: 24px;
    border-radius: var(--radius-md);
    text-align: center;
  }

  .state-error {
    background: rgba(255, 107, 107, 0.1);
  }

  .primary {
    background: linear-gradient(135deg, #ffb038, #45f2c1);
    color: #1b1303;
    font-weight: 600;
    border-radius: 999px;
    padding: 10px 18px;
    font-size: 13px;
    cursor: pointer;
    border: 0;
  }
</style>
