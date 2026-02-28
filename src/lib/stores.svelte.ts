import { getFeed } from './api';
import type { FeedItem } from './types';
import { SvelteSet } from 'svelte/reactivity';

const DAY_MS = 24 * 60 * 60 * 1000;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseCsvList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

class AppState {
  theme = $state<'dark' | 'light'>('dark');
  categories = new SvelteSet<string>(['tech', 'tech updates', 'hobby project']);
  sources = new SvelteSet<string>(['youtube', 'reddit', 'web']);
  pausedSourceIds = new SvelteSet<string>();
  media = $state('all');
  connectedSources = new SvelteSet<string>();
  loading = $state(true);
  error = $state(false);
  errorMessage = $state('');
  feed = $state<FeedItem[]>([]);
  focusMode = $state(false);
  selectedItem = $state<FeedItem | null>(null);
  openToComments = $state(false);
  query = $state('');
  region = $state('global');
  dateFrom = $state('');
  dateTo = $state('');
  videoLength = $state<'any' | 'short' | 'medium' | 'long'>('any');
  intent = $state<'all' | 'educational' | 'entertainment' | 'news'>('all');
  includeKeywords = $state<string[]>([]);
  excludeKeywords = $state<string[]>([]);
  pulseMode = $state(true);
  nextCursor = $state<string | null>(null);
  hasMore = $state(false);

  // Time-boxing
  timeboxMinutes = $state(30);
  todayUsageSeconds = $state(0);
  timeboxReached = $state(false);

  // Streaks
  appStreak = $state(1);
  channelStreaks = $state<Record<string, { count: number; lastDate: string }>>({});

  private usageTimer: number | null = null;

  constructor() {
    this.loadLocalPrefs();
    this.recordAppVisit();
    this.applyTheme();
    this.initHistoryListener();
  }

  private loadLocalPrefs() {
    if (typeof window === 'undefined') return;
    try {
      const savedTheme = window.localStorage.getItem('craveit:theme');
      if (savedTheme === 'light') this.theme = 'light';

      const paused = JSON.parse(window.localStorage.getItem('craveit:paused-sources') || '[]');
      if (Array.isArray(paused)) {
        paused.forEach((id) => this.pausedSourceIds.add(String(id)));
      }

      const include = window.localStorage.getItem('craveit:include-keywords') || '';
      const exclude = window.localStorage.getItem('craveit:exclude-keywords') || '';
      this.includeKeywords = parseCsvList(include);
      this.excludeKeywords = parseCsvList(exclude);

      const intent = window.localStorage.getItem('craveit:intent');
      if (intent === 'educational' || intent === 'entertainment' || intent === 'news' || intent === 'all') {
        this.intent = intent;
      }

      const pulse = window.localStorage.getItem('craveit:pulse');
      if (pulse === '0') this.pulseMode = false;

      const configuredMinutes = Number(window.localStorage.getItem('craveit:timebox-minutes') || '30');
      this.timeboxMinutes = Number.isFinite(configuredMinutes)
        ? Math.max(5, Math.min(240, Math.floor(configuredMinutes)))
        : 30;

      const usage = JSON.parse(window.localStorage.getItem('craveit:timebox-usage') || '{}');
      const today = todayKey();
      this.todayUsageSeconds = usage[today] ?? 0;
      this.timeboxReached = this.todayUsageSeconds >= this.timeboxMinutes * 60;

      const channels = JSON.parse(window.localStorage.getItem('craveit:streak:channels') || '{}');
      if (channels && typeof channels === 'object') this.channelStreaks = channels;
    } catch {
      // Ignore malformed local storage values.
    }
  }

  private persistPrefs() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('craveit:theme', this.theme);
    window.localStorage.setItem(
      'craveit:paused-sources',
      JSON.stringify(Array.from(this.pausedSourceIds))
    );
    window.localStorage.setItem('craveit:include-keywords', this.includeKeywords.join(', '));
    window.localStorage.setItem('craveit:exclude-keywords', this.excludeKeywords.join(', '));
    window.localStorage.setItem('craveit:intent', this.intent);
    window.localStorage.setItem('craveit:pulse', this.pulseMode ? '1' : '0');
    window.localStorage.setItem('craveit:timebox-minutes', String(this.timeboxMinutes));
    window.localStorage.setItem('craveit:streak:channels', JSON.stringify(this.channelStreaks));
  }

  private applyTheme() {
    if (typeof document === 'undefined') return;
    if (this.theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.persistPrefs();
  }

  private initHistoryListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('popstate', (event) => {
      if (this.selectedItem && (!event.state || event.state.type !== 'detail')) {
        this.closeItem(false); // Close without pushing new state
      }
    });
  }

  private saveUsage(seconds: number) {
    if (typeof window === 'undefined') return;
    const usage = JSON.parse(window.localStorage.getItem('craveit:timebox-usage') || '{}');
    usage[todayKey()] = seconds;
    window.localStorage.setItem('craveit:timebox-usage', JSON.stringify(usage));
  }

  private computeStreak(lastDate: string | undefined, count: number) {
    const now = new Date();
    const current = new Date(`${todayKey()}T00:00:00Z`).getTime();
    if (!lastDate) return 1;
    const previous = new Date(`${lastDate}T00:00:00Z`).getTime();
    if (previous === current) return count;
    if (current - previous <= DAY_MS) return count + 1;
    return 1;
  }

  recordAppVisit() {
    if (typeof window === 'undefined') return;
    const raw = JSON.parse(window.localStorage.getItem('craveit:streak:app') || '{}');
    const currentCount = Number(raw.count || 0);
    const next = {
      lastDate: todayKey(),
      count: this.computeStreak(raw.lastDate, currentCount)
    };
    this.appStreak = next.count;
    window.localStorage.setItem('craveit:streak:app', JSON.stringify(next));
  }

  recordChannelVisit(channelId: string) {
    if (!channelId) return;
    const existing = this.channelStreaks[channelId] ?? { count: 0, lastDate: '' };
    const next = {
      lastDate: todayKey(),
      count: this.computeStreak(existing.lastDate, existing.count)
    };
    this.channelStreaks = {
      ...this.channelStreaks,
      [channelId]: next
    };
    this.persistPrefs();
  }

  setTimeboxMinutes(minutes: number) {
    this.timeboxMinutes = Math.max(5, Math.min(240, Math.floor(minutes)));
    this.timeboxReached = this.todayUsageSeconds >= this.timeboxMinutes * 60;
    this.persistPrefs();
  }

  startUsageTracking() {
    if (this.usageTimer || typeof window === 'undefined') return;
    this.usageTimer = window.setInterval(() => {
      if (document.hidden) return;
      this.todayUsageSeconds += 1;
      if (this.todayUsageSeconds % 15 === 0) {
        this.saveUsage(this.todayUsageSeconds);
      }
      this.timeboxReached = this.todayUsageSeconds >= this.timeboxMinutes * 60;
    }, 1000);
  }

  stopUsageTracking() {
    if (this.usageTimer && typeof window !== 'undefined') {
      window.clearInterval(this.usageTimer);
      this.usageTimer = null;
      this.saveUsage(this.todayUsageSeconds);
    }
  }

  async refreshFeed(options?: { append?: boolean }) {
    const append = options?.append ?? false;
    this.loading = true;
    this.error = false;
    this.errorMessage = '';
    try {
      const categories = Array.from(this.categories);
      const selectedSources = Array.from(this.sources);
      const payload = await getFeed({
        categories,
        sources: selectedSources,
        mediaType: this.media,
        focus: this.focusMode,
        limit: 12,
        cursor: append ? this.nextCursor ?? undefined : undefined,
        query: this.query,
        region: this.region,
        dateFrom: this.dateFrom,
        dateTo: this.dateTo,
        videoLength: this.videoLength,
        intent: this.intent,
        include: this.includeKeywords,
        exclude: this.excludeKeywords,
        pulse: this.pulseMode,
        pausedSourceIds: Array.from(this.pausedSourceIds)
      });

      this.nextCursor = payload.nextCursor ?? null;
      this.hasMore = Boolean(payload.nextCursor);

      if (append) {
        this.feed = [...this.feed, ...payload.items];
      } else {
        this.feed = payload.items;
      }
    } catch (e: any) {
      this.error = true;
      this.errorMessage = e?.message ?? 'Failed to load feed';
    } finally {
      this.loading = false;
    }
  }

  loadMore() {
    if (!this.hasMore || this.loading) return;
    return this.refreshFeed({ append: true });
  }

  toggleCategory(tag: string) {
    if (this.categories.has(tag)) {
      this.categories.delete(tag);
    } else {
      this.categories.add(tag);
    }
    this.refreshFeed();
  }

  setCategories(tags: string[]) {
    this.categories.clear();
    tags.forEach((tag) => this.categories.add(tag));
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
    this.query = '';
    this.region = 'global';
    this.dateFrom = '';
    this.dateTo = '';
    this.videoLength = 'any';
    this.includeKeywords = [];
    this.excludeKeywords = [];
    this.intent = 'all';
    this.pulseMode = true;
    this.persistPrefs();
    this.refreshFeed();
  }

  toggleFocusMode() {
    this.focusMode = !this.focusMode;
  }

  setSearchQuery(value: string) {
    this.query = value;
  }

  setRegion(value: string) {
    this.region = value;
  }

  setDateRange(from: string, to: string) {
    this.dateFrom = from;
    this.dateTo = to;
  }

  setVideoLength(value: 'any' | 'short' | 'medium' | 'long') {
    this.videoLength = value;
  }

  setIntent(value: 'all' | 'educational' | 'entertainment' | 'news') {
    this.intent = value;
    this.persistPrefs();
    this.refreshFeed();
  }

  setIncludeKeywords(value: string) {
    this.includeKeywords = parseCsvList(value);
    this.persistPrefs();
  }

  setExcludeKeywords(value: string) {
    this.excludeKeywords = parseCsvList(value);
    this.persistPrefs();
  }

  setPulseMode(value: boolean) {
    this.pulseMode = value;
    this.persistPrefs();
    this.refreshFeed();
  }

  togglePausedSource(sourceId: string) {
    if (this.pausedSourceIds.has(sourceId)) {
      this.pausedSourceIds.delete(sourceId);
    } else {
      this.pausedSourceIds.add(sourceId);
    }
    this.persistPrefs();
    this.refreshFeed();
  }

  openItem(item: FeedItem, toComments = false) {
    this.selectedItem = item;
    this.openToComments = toComments;
    this.recordChannelVisit(item.sourceId || item.author || item.source);
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'detail', id: item.id }, '');
    }
  }

  closeItem(shouldPopHistory = true) {
    this.selectedItem = null;
    this.openToComments = false;
    if (shouldPopHistory && typeof window !== 'undefined' && window.history.state?.type === 'detail') {
      window.history.back();
    }
  }
}

export const appState = new AppState();

export function refreshFeed() {
  return appState.refreshFeed();
}

export function loadMoreFeed() {
  return appState.loadMore();
}

export function toggleCategory(tag: string) {
  return appState.toggleCategory(tag);
}

export function setCategories(tags: string[]) {
  return appState.setCategories(tags);
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

export function setSearchQuery(value: string) {
  return appState.setSearchQuery(value);
}

export function setRegion(value: string) {
  return appState.setRegion(value);
}

export function setDateRange(from: string, to: string) {
  return appState.setDateRange(from, to);
}

export function setVideoLength(value: 'any' | 'short' | 'medium' | 'long') {
  return appState.setVideoLength(value);
}

export function setIntent(value: 'all' | 'educational' | 'entertainment' | 'news') {
  return appState.setIntent(value);
}

export function setIncludeKeywords(value: string) {
  return appState.setIncludeKeywords(value);
}

export function setExcludeKeywords(value: string) {
  return appState.setExcludeKeywords(value);
}

export function setPulseMode(value: boolean) {
  return appState.setPulseMode(value);
}

export function setTimeboxMinutes(minutes: number) {
  return appState.setTimeboxMinutes(minutes);
}

export function startUsageTracking() {
  return appState.startUsageTracking();
}

export function stopUsageTracking() {
  return appState.stopUsageTracking();
}

export function togglePausedSource(sourceId: string) {
  return appState.togglePausedSource(sourceId);
}

export function openFeedItem(item: FeedItem, toComments = false) {
  return appState.openItem(item, toComments);
}

export function closeFeedItem() {
  return appState.closeItem();
}

export function toggleTheme() {
  return appState.toggleTheme();
}
