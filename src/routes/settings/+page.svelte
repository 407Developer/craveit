<script lang="ts">
  import { onMount } from 'svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  
  let deferredInstall = $state<any>(null);
  let showInstallBtn = $state(false);

  onMount(() => {
    const handler = (event: any) => {
      event.preventDefault();
      deferredInstall = event;
      showInstallBtn = true;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  });

  async function handleInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    showInstallBtn = false;
  }
</script>

<main class="settings-stack">
  <section class="panel">
    <h2>App Controls</h2>
    <p>Manage feed filters and preferences.</p>
  </section>

  <FilterBar />

  {#if showInstallBtn}
    <section class="panel">
      <h2>Install App</h2>
      <p>Install craveit on this device for quick access.</p>
      <button class="primary" onclick={handleInstall}>Install</button>
    </section>
  {/if}
</main>

<style>
  .settings-stack {
    display: grid;
    gap: 16px;
  }

  .panel {
    background: rgba(13, 34, 30, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(6px);
  }

  .panel h2 {
    margin: 0 0 6px;
    font-size: 18px;
  }

  .panel p {
    margin: 0;
    color: var(--ink-soft);
    font-size: 14px;
  }
</style>
