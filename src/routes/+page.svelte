<script lang="ts">
  import { onMount } from 'svelte';
  import { refreshFeed } from '$lib/stores.svelte';
  import Onboarding from '$lib/components/Onboarding.svelte';
  import SourceManager from '$lib/components/SourceManager.svelte';
  import CategoryChips from '$lib/components/CategoryChips.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import FeedList from '$lib/components/FeedList.svelte';
  import DetailDrawer from '$lib/components/DetailDrawer.svelte';

  let deferredInstall = $state<any>(null);
  let showInstallBtn = $state(false);

  onMount(() => {
    refreshFeed();

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstall = event;
      showInstallBtn = true;
    });
  });

  async function handleInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    showInstallBtn = false;
  }
</script>

<header class="app-header">
  <div class="brand">
    <div class="brand-mark">c</div>
    <div class="brand-text">
      <div class="brand-name">craveit</div>
      <div class="brand-tag">curated feeds, your rules</div>
    </div>
  </div>
  {#if showInstallBtn}
    <button class="ghost" onclick={handleInstall}>Install</button>
  {/if}
</header>

<main class="app-main">
  <Onboarding />
  <SourceManager />
  <CategoryChips />
  <FeedList>
    {#snippet filters()}
      <FilterBar />
    {/snippet}
  </FeedList>
</main>

<DetailDrawer />

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    max-width: 1120px;
    margin-inline: auto;
    gap: 12px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .brand-mark {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #45f2c1, #ffb038);
    display: grid;
    place-items: center;
    font-size: 24px;
    font-weight: 700;
    color: #06301d;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .brand-name {
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 0.4px;
  }

  .brand-tag {
    color: var(--ink-soft);
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .app-main {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1120px;
    margin-inline: auto;
  }

  @media (min-width: 720px) {
    .app-main {
      padding: 0 20px;
    }
  }

  @media (max-width: 560px) {
    .app-header {
      flex-wrap: wrap;
    }
  }
</style>
