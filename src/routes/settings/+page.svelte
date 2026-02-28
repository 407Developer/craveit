<script lang="ts">
  import { onMount } from 'svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import { appState, setTimeboxMinutes, togglePausedSource } from '$lib/stores.svelte';
  import { getSources } from '$lib/api';

  let deferredInstall = $state<any>(null);
  let showInstallBtn = $state(false);
  let sources = $state<any[]>([]);
  let timebox = $state(30);
  let curationDue = $state(false);

  onMount(() => {
    const handler = (event: any) => {
      event.preventDefault();
      deferredInstall = event;
      showInstallBtn = true;
    };
    window.addEventListener('beforeinstallprompt', handler);
    timebox = appState.timeboxMinutes;
    getSources().then((data) => {
      sources = data.connected ?? [];
    });
    const last = window.localStorage.getItem('craveit:last-curation');
    if (!last) {
      curationDue = true;
    } else {
      const elapsedDays = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
      curationDue = elapsedDays >= 30;
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  });

  async function handleInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    showInstallBtn = false;
  }

  function applyTimebox() {
    setTimeboxMinutes(timebox);
  }

  function completeCuration() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('craveit:last-curation', new Date().toISOString());
    curationDue = false;
  }
</script>

<main class="settings-stack">
  <section class="panel">
    <h2>Intent & Filtering</h2>
    <p>Control what appears instead of letting algorithms decide for you.</p>
  </section>

  <FilterBar />

  <section class="panel">
    <h2>Daily Timebox</h2>
    <p>Protect your time. When the limit is reached, the feed pauses.</p>
    <div class="timebox-row">
      <input type="range" min="5" max="180" bind:value={timebox} />
      <span>{timebox} min/day</span>
      <button class="ghost" onclick={applyTimebox}>Save</button>
    </div>
  </section>

  <section class="panel">
    <h2>Curation Mode (30-Day Cleanup)</h2>
    <p>Pause sources that no longer serve your current taste.</p>
    {#if curationDue}
      <div class="due-banner">Curation due now. Review your sources and confirm when done.</div>
    {/if}
    <div class="curation-list">
      {#each sources as source}
        <div class="curation-row">
          <span>{source.title}</span>
          <button class="ghost" class:active={appState.pausedSourceIds.has(source.id)} onclick={() => togglePausedSource(source.id)}>
            {appState.pausedSourceIds.has(source.id) ? 'Paused' : 'Keep'}
          </button>
        </div>
      {/each}
    </div>
    {#if curationDue}
      <button class="ghost done-btn" onclick={completeCuration}>I finished curation</button>
    {/if}
  </section>

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
    background: var(--bg-soft);
    border: 0;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
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

  .timebox-row {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  input[type='range'] {
    flex: 1;
    min-width: 220px;
  }

  .curation-list {
    margin-top: 12px;
    display: grid;
    gap: 8px;
  }

  .due-banner {
    margin-top: 10px;
    background: rgba(255, 176, 56, 0.15);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
  }

  .curation-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 10px;
  }

  .ghost.active {
    background: rgba(255, 176, 56, 0.2);
    border-color: rgba(255, 176, 56, 0.45);
  }

  .done-btn {
    margin-top: 10px;
  }
</style>
