<script lang="ts">
  import { onMount } from 'svelte';
  import { refreshFeed } from '$lib/stores.svelte';
  import FeedList from '$lib/components/FeedList.svelte';
  import DetailDrawer from '$lib/components/DetailDrawer.svelte';

  onMount(() => {
    refreshFeed();
  });
</script>

<main class="app-main">
  <FeedList />
</main>

<DetailDrawer />

<style>
  .app-main {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
  }
</style>
