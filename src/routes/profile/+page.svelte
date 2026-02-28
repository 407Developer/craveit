<script lang="ts">
  import { appState } from '$lib/stores.svelte';

  let channels = $derived(
    Object.entries(appState.channelStreaks)
      .map(([channel, value]) => ({ channel, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  );
</script>

<section class="panel profile">
  <div class="avatar">@</div>
  <h2>Profile</h2>
  <p>High-agency feed, zero algorithmic guessing.</p>

  <div class="streak-grid">
    <div class="streak-card">
      <span>App streak</span>
      <strong>{appState.appStreak} days</strong>
    </div>
    <div class="streak-card">
      <span>Today's usage</span>
      <strong>{Math.floor(appState.todayUsageSeconds / 60)} min</strong>
    </div>
  </div>

  <div class="channels">
    <h3>Channel streaks</h3>
    {#if channels.length === 0}
      <p class="muted">Open posts to start channel streaks.</p>
    {:else}
      {#each channels as entry}
        <div class="channel-row">
          <span>{entry.channel}</span>
          <strong>{entry.count}d</strong>
        </div>
      {/each}
    {/if}
  </div>
</section>

<style>
  .panel {
    background: var(--bg-soft);
    border: 0;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(10px);
  }


  .profile {
    display: grid;
    gap: 12px;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    background: linear-gradient(135deg, #45f2c1, #ffb038);
    color: #10231d;
    font-weight: 700;
    font-size: 26px;
    display: grid;
    place-items: center;
  }

  h2,
  p,
  h3 {
    margin: 0;
  }

  p,
  .muted {
    color: var(--ink-soft);
  }

  .streak-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .streak-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px;
    display: grid;
    gap: 4px;
  }

  .streak-card span {
    font-size: 12px;
    color: var(--ink-soft);
  }

  .channels {
    display: grid;
    gap: 8px;
  }

  .channel-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    padding: 8px 10px;
  }

  @media (max-width: 560px) {
    .streak-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
