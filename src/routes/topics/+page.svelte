<script lang="ts">
  import Onboarding from '$lib/components/Onboarding.svelte';
  import CategoryChips from '$lib/components/CategoryChips.svelte';
</script>

<main class="stack">
  <Onboarding />
  <CategoryChips />
</main>

<style>
  .stack {
    display: grid;
    gap: 16px;
  }
</style>
