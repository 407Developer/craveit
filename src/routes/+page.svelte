<script lang="ts">
  import { onMount } from 'svelte';
  import { appState, refreshFeed } from '$lib/stores.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import FeedList from '$lib/components/FeedList.svelte';
  import DetailDrawer from '$lib/components/DetailDrawer.svelte';
  import { fade, slide, scale } from 'svelte/transition';

  let showCelebration = $state(false);
  let milestone = $state(0);

  onMount(() => {
    refreshFeed();
    
    // Check for streak milestones (e.g., every 5 days or first day)
    const streak = appState.appStreak;
    const celebrated = JSON.parse(localStorage.getItem('craveit:celebrated-streaks') || '[]');
    
    if (streak > 0 && !celebrated.includes(streak) && (streak === 1 || streak % 5 === 0)) {
      milestone = streak;
      showCelebration = true;
      celebrated.push(streak);
      localStorage.setItem('craveit:celebrated-streaks', JSON.stringify(celebrated));
    }
  });

  function dismissCelebration() {
    showCelebration = false;
  }
</script>

<main class="app-main">
  {#if showCelebration}
    <div class="celebration-overlay" transition:fade onclick={dismissCelebration}>
      <div class="celebration-card" transition:scale={{ start: 0.9, duration: 400 }} onclick={(e) => e.stopPropagation()}>
        <div class="confetti">✨ 🎉 🎊</div>
        <h2>{milestone} Day Streak!</h2>
        <p>You're building a high-agency content habit. Keep craving the good stuff.</p>
        <button class="primary" onclick={dismissCelebration}>Let's go!</button>
      </div>
    </div>
  {/if}

  <FeedList>
    {#snippet filters()}
      <FilterBar compact />
    {/snippet}
  </FeedList>
</main>

<DetailDrawer />

<style>
  .app-main {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  }

  .celebration-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .celebration-card {
    background: var(--bg-soft);
    padding: 40px 30px;
    border-radius: 32px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
    border: 2px solid var(--accent-2);
    position: relative;
  }

  .confetti {
    font-size: 40px;
    margin-bottom: 16px;
  }

  .celebration-card h2 {
    font-size: 32px;
    margin: 0 0 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .celebration-card p {
    color: var(--ink-soft);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .celebration-card .primary {
    width: 100%;
    padding: 14px;
    font-size: 16px;
  }
</style>
