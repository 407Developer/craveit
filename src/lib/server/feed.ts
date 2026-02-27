import type { FeedItem, MediaType } from '$lib/types';

export const mockFeed: FeedItem[] = [
  {
    id: 'yt-1',
    source: 'youtube',
    title: 'Building a tiny home lab in a weekend',
    summary: 'A full walkthrough of setting up a compact home server rack with low power draw.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mediaType: 'video',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-02-24T09:45:00Z',
    author: 'ByteCraft',
    topicTags: ['tech', 'hobby project'],
    score: 92
  },
  {
    id: 'rd-1',
    source: 'reddit',
    title: 'New kernel patch reduces wake latency',
    summary: 'Discussion on kernel scheduler changes and battery impacts across devices.',
    url: 'https://www.reddit.com/r/linux/comments/abcdef/new_kernel_patch/',
    mediaType: 'text',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-02-23T19:15:00Z',
    author: 'sysroot',
    topicTags: ['tech updates'],
    score: 76
  },
  {
    id: 'yt-2',
    source: 'youtube',
    title: '3 tools to ship hobby apps faster',
    summary: 'Speed up prototypes with AI scaffolds, instant APIs, and rapid testing loops.',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    mediaType: 'video',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-02-22T15:30:00Z',
    author: 'LaunchKit',
    topicTags: ['hobby project', 'tech'],
    score: 88
  },
  {
    id: 'rd-2',
    source: 'reddit',
    title: 'Policy thread: 2026 tech regulation proposals',
    summary: 'A breakdown of policy proposals and how they affect AI research and funding.',
    url: 'https://www.reddit.com/r/politics/comments/ghijkl/2026_regulation_proposals/',
    mediaType: 'text',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
    createdAt: '2026-02-21T11:10:00Z',
    author: 'policywonk',
    topicTags: ['politics'],
    score: 61
  }
];

export function filterFeed(params: {
  sources?: string[];
  categories?: string[];
  mediaType?: MediaType | 'all' | null;
}) {
  const sources = params.sources ?? [];
  const categories = params.categories ?? [];
  const mediaType = params.mediaType ?? 'all';

  return mockFeed.filter((item) => {
    const sourceMatch = sources.length === 0 || sources.includes(item.source);
    const categoryMatch =
      categories.length === 0 || item.topicTags.some((tag) => categories.includes(tag));
    const mediaMatch = mediaType === 'all' || item.mediaType === mediaType;
    return sourceMatch && categoryMatch && mediaMatch;
  });
}
