<script lang="ts">
  import { onMount } from 'svelte';

  let deferredPrompt = $state<any>(null);
  let isInstalled = $state(false);
  let canInstall = $state(false);

  onMount(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      isInstalled = true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      canInstall = true;
    });

    window.addEventListener('appinstalled', () => {
      // Clear the deferredPrompt so it can be garbage collected
      deferredPrompt = null;
      canInstall = false;
      isInstalled = true;
      console.log('PWA was installed');
    });
  });

  async function handleInstall() {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    canInstall = false;
  }
</script>

<div class="install-container">
  {#if isInstalled}
    <div class="status-chip installed">
      <span class="icon">✅</span>
      <span>App Installed</span>
    </div>
  {:else if canInstall}
    <div class="install-box">
      <div class="text">
        <strong>Install Craveit</strong>
        <p>Add to your home screen for a full-screen, distraction-free experience.</p>
      </div>
      <button class="primary" onclick={handleInstall}>Install App</button>
    </div>
  {:else}
    <div class="status-chip info">
      <span class="icon">💡</span>
      <span>To install, use your browser's "Add to Home Screen" menu.</span>
    </div>
  {/if}
</div>

<style>
  .install-container {
    width: 100%;
    margin-top: 12px;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
  }

  .status-chip.installed {
    background: rgba(69, 242, 193, 0.12);
    color: var(--accent-2);
    border: 1px solid rgba(69, 242, 193, 0.2);
  }

  .status-chip.info {
    background: rgba(255, 255, 255, 0.05);
    color: var(--ink-soft);
    font-weight: 400;
  }

  .install-box {
    background: linear-gradient(135deg, rgba(255, 176, 56, 0.1), rgba(69, 242, 193, 0.1));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  .install-box strong {
    display: block;
    font-size: 18px;
    margin-bottom: 4px;
    color: var(--ink);
  }

  .install-box p {
    margin: 0;
    font-size: 13px;
    color: var(--ink-soft);
    line-height: 1.5;
  }

  .install-box .primary {
    width: 100%;
    max-width: 200px;
  }

  @media (min-width: 600px) {
    .install-box {
      flex-direction: row;
      text-align: left;
      justify-content: space-between;
    }
    .install-box .primary {
      width: auto;
    }
  }
</style>
