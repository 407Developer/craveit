import type { FeedSource } from '$lib/server/providers/rss';

const sources: FeedSource[] = [
  {
    id: 'yt-verge',
    type: 'rss',
    title: 'The Verge YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCddiUEpeqJcYeBxX1IVBKvQ',
    source: 'youtube',
    topicTags: ['tech', 'tech updates']
  },
  {
    id: 'yt-mkbhd',
    type: 'rss',
    title: 'MKBHD',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ',
    source: 'youtube',
    topicTags: ['tech', 'tech updates']
  },
  {
    id: 'rd-technology',
    type: 'rss',
    title: 'r/technology',
    url: 'https://openrss.org/feeds/reddit/r/technology',
    source: 'reddit',
    topicTags: ['tech', 'tech updates']
  },
  {
    id: 'rd/politics',
    type: 'rss',
    title: 'r/politics',
    url: 'https://openrss.org/feeds/reddit/r/politics',
    source: 'reddit',
    topicTags: ['politics']
  }
];

export function getSources() {
  return sources;
}

export function addSource(source: FeedSource) {
  sources.push(source);
}

export function removeSource(id: string) {
  const index = sources.findIndex((source) => source.id === id);
  if (index >= 0) sources.splice(index, 1);
}
