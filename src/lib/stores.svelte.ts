import { getFeed } from './api';
import type { FeedItem } from './types';
import { SvelteSet } from 'svelte/reactivity';

class AppState {
  categories = new SvelteSet<string>(['tech', 'tech updates']);
  sources = new SvelteSet<string>(['youtube', 'reddit']);
  media = $state('all');
  connectedSources = new SvelteSet<string>();
  loading = $state(true);
  error = $state(false);
  feed = $state<FeedItem[]>([]);
  focusMode = $state(false);
  selectedItem = $state<FeedItem | null>(null);

  async refreshFeed() {
    this.loading = true;
    this.error = false;
    try {
      const categories = Array.from(this.categories);
      const sources = Array.from(this.sources);
      this.feed = await getFeed({
        categories,
        sources,
        mediaType: this.media,
        focus: this.focusMode
      });
    } catch (e) {
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  toggleCategory(tag: string) {
    if (this.categories.has(tag)) {
      this.categories.delete(tag);
    } else {
      this.categories.add(tag);
    }
    this.refreshFeed();
  }

  toggleSource(source: string) {
    if (this.sources.has(source)) {
      this.sources.delete(source);
    } else {
      this.sources.add(source);
    }
    this.refreshFeed();
  }

  setMedia(media: string) {
    this.media = media;
    this.refreshFeed();
  }

  clearFilters() {
    this.categories.clear();
    this.sources.clear();
    this.media = 'all';
    this.refreshFeed();
  }

  toggleFocusMode() {
    this.focusMode = !this.focusMode;
  }
}

export const appState = new AppState();

export function refreshFeed() {
  return appState.refreshFeed();
}

export function toggleCategory(tag: string) {
  return appState.toggleCategory(tag);
}

export function toggleSource(source: string) {
  return appState.toggleSource(source);
}

export function setMedia(media: string) {
  return appState.setMedia(media);
}

export function clearFilters() {
  return appState.clearFilters();
}

export function toggleFocusMode() {
  return appState.toggleFocusMode();
}
