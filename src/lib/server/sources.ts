import type { FeedSource } from '$lib/server/providers/rss';

const sources: FeedSource[] = [
  {
    id: 'yt-verge',
    type: 'rss',
    title: 'The Verge YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCddiUEpeqJcYeBxX1IVBKvQ',
    source: 'youtube',
    topicTags: ['tech', 'tech updates'],
    weight: 100
  },
  {
    id: 'yt-mkbhd',
    type: 'rss',
    title: 'MKBHD',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ',
    source: 'youtube',
    topicTags: ['tech', 'tech updates'],
    weight: 100
  },
  {
    id: 'rd-technology',
    type: 'rss',
    title: 'r/technology',
    url: 'https://www.reddit.com/r/technology/.rss',
    source: 'reddit',
    topicTags: ['tech', 'tech updates'],
    weight: 100
  },
  {
    id: 'rd-politics',
    type: 'rss',
    title: 'r/politics',
    url: 'https://www.reddit.com/r/politics/.rss',
    source: 'reddit',
    topicTags: ['politics'],
    weight: 100
  },
  {
    id: 'web-tc',
    type: 'rss',
    title: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    source: 'web',
    topicTags: ['tech updates', 'tech'],
    weight: 100
  },
  {
    id: 'web-wired',
    type: 'rss',
    title: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    source: 'web',
    topicTags: ['tech updates', 'tech'],
    weight: 100
  },
  {
    id: 'web-ars',
    type: 'rss',
    title: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    source: 'web',
    topicTags: ['tech updates', 'tech'],
    weight: 100
  },
  {
    id: 'web-hn',
    type: 'rss',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    source: 'web',
    topicTags: ['tech', 'hobby project'],
    weight: 100
  },
  {
    id: 'web-verge',
    type: 'rss',
    title: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    source: 'web',
    topicTags: ['tech updates', 'tech'],
    weight: 100
  }
];

export function getSources() {
  return sources;
}

export function addSource(source: FeedSource) {
  sources.push({ ...source, weight: source.weight ?? 100 });
}

export function removeSource(id: string) {
  const index = sources.findIndex((source) => source.id === id);
  if (index >= 0) sources.splice(index, 1);
}

export function updateSourceWeight(id: string, weight: number) {
  const source = sources.find((entry) => entry.id === id);
  if (!source) return null;
  source.weight = Math.max(0, Math.min(100, Math.round(weight)));
  return source;
}
