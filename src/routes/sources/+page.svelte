<script lang="ts">
  import Onboarding from '$lib/components/Onboarding.svelte';
  import SourceManager from '$lib/components/SourceManager.svelte';
</script>

<main class="stack">
  <Onboarding />
  <SourceManager />
</main>

<style>
  .stack {
    display: grid;
    gap: 16px;
  }
</style>
