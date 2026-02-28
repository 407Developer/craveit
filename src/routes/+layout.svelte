<script lang="ts">
  import { onMount } from "svelte";
  import { page } from '$app/state';
  import { appState, startUsageTracking, stopUsageTracking, toggleTheme } from '$lib/stores.svelte';
  import "../app.css";
  let { children } = $props();

  onMount(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js");
    }
    startUsageTracking();
    return () => stopUsageTracking();
  });

  const navItems = [
    {
      href: '/',
      label: 'Feed',
      icon: 'home'
    },
    {
      href: '/sources',
      label: 'Sources',
      icon: 'layers'
    },
    {
      href: '/topics',
      label: 'Topics',
      icon: 'spark'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: 'gear'
    }
  ];
</script>

<div class="bg-orb orb-a" aria-hidden="true"></div>
<div class="bg-orb orb-b" aria-hidden="true"></div>

<div class="shell">
  <header class="topbar">
    <a class="brand" href="/">
      <span class="brand-mark">c</span>
      <span class="brand-name">craveit</span>
    </a>

    <div class="topbar-actions">
      {#if appState.appStreak > 0}
        <div class="streak-badge" title="Daily Streak">
          <span class="fire">🔥</span>
          <span class="count">{appState.appStreak}</span>
        </div>
      {/if}

      <button class="icon-btn theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        {#if appState.theme === 'dark'}
          ☀️
        {:else}
          🌙
        {/if}
      </button>

      <a class="profile-btn" href="/profile" aria-label="Profile">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"></path>
        </svg>
      </a>
    </div>
  </header>

  <main class="page-wrap">
    {@render children()}
  </main>

  <nav class="bottom-nav" aria-label="Primary">
    {#each navItems as item}
      {@const active = item.href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(item.href)}
      <a class="nav-link" class:active={active} href={item.href} aria-label={item.label}>
        {#if item.icon === 'home'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"></path>
          </svg>
        {:else if item.icon === 'layers'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m12 3 9 5-9 5-9-5 9-5Zm0 8 8.72-4.84L22 7l-10 5.56L2 7l1.28-0.84L12 11Zm0 4 8.72-4.84L22 11l-10 5.56L2 11l1.28-0.84L12 15Z"></path>
          </svg>
        {:else if item.icon === 'spark'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 2h2l1.5 4.5L19 8v2l-4.5 1.5L13 16h-2l-1.5-4.5L5 10V8l4.5-1.5L11 2Zm8 13h1l.8 2.2L23 18v1l-2.2.8L20 22h-1l-.8-2.2L16 19v-1l2.2-.8L19 15ZM3 14h1l1 3 3 1v1l-3 1-1 3H3l-1-3-3-1v-1l3-1 1-3Z"></path>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.8 2h2.4l.4 2.2a7.88 7.88 0 0 1 1.8.75l1.95-1.1 1.7 1.7-1.1 1.95c.3.57.55 1.17.75 1.8L22 10.8v2.4l-2.2.4a7.88 7.88 0 0 1-.75 1.8l1.1 1.95-1.7 1.7-1.95-1.1a7.88 7.88 0 0 1-1.8.75L13.2 22h-2.4l-.4-2.2a7.88 7.88 0 0 1-1.8-.75l-1.95 1.1-1.7-1.7 1.1-1.95a7.88 7.88 0 0 1-.75-1.8L2 13.2v-2.4l2.2-.4c.2-.63.45-1.23.75-1.8l-1.1-1.95 1.7-1.7 1.95 1.1c.57-.3 1.17-.55 1.8-.75L10.8 2ZM12 9a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z"></path>
          </svg>
        {/if}
        <span>{item.label}</span>
      </a>
    {/each}
  </nav>
</div>

<style>
  .shell {
    min-height: 100dvh;
    padding-bottom: 90px;
    position: relative;
    z-index: 1;
  }

  .topbar {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    text-decoration: none;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: linear-gradient(135deg, #45f2c1, #ffb038);
    display: grid;
    place-items: center;
    font-size: 20px;
    font-weight: 700;
    color: #06301d;
  }

  .brand-name {
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-btn, .profile-btn {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 0;
    background: rgba(255, 255, 255, 0.1);
    display: grid;
    place-items: center;
    color: var(--ink);
    text-decoration: none;
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .icon-btn:hover, .profile-btn:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.15);
  }

  .streak-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 107, 53, 0.12);
    padding: 6px 14px;
    border-radius: 999px;
    color: #ff6b35;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
    border: 1px solid rgba(255, 107, 53, 0.2);
    animation: streakPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .streak-badge .fire {
    animation: flamePulse 2s infinite alternate;
  }

  @keyframes streakPop {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes flamePulse {
    0% { transform: scale(1); filter: drop-shadow(0 0 2px #ff6b35); }
    100% { transform: scale(1.2); filter: drop-shadow(0 0 6px #ff6b35); }
  }

  .profile-btn svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .page-wrap {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 16px;
  }

  .bottom-nav {
    position: fixed;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    width: min(520px, calc(100vw - 16px));
    background: rgba(var(--nav-bg-rgb, 12, 22, 21), 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 6px;
    z-index: 20;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  :root.theme-light .bottom-nav {
    background: rgba(245, 252, 249, 0.9);
    border: 1px solid rgba(26, 44, 38, 0.05);
    box-shadow: 0 10px 30px rgba(22, 54, 46, 0.1);
  }

  .nav-link {
    border-radius: 14px;
    min-height: 54px;
    color: var(--ink-soft);
    text-decoration: none;
    display: grid;
    place-items: center;
    gap: 4px;
    font-size: 11px;
    transition: all 0.2s ease;
  }

  .nav-link svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }

  .nav-link.active {
    background: rgba(69, 242, 193, 0.14);
    color: var(--accent-2);
    font-weight: 600;
  }
</style>
