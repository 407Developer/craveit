import Parser from 'rss-parser';

export type RssItem = {
  id: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  author: string;
  published: string;
  thumbnail: string;
};

const parser: Parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  },
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ]
  }
});

function stripHtml(input: string) {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

function pickThumbnail(item: any) {
  // YouTube special
  if (item.mediaGroup?.['media:thumbnail']) {
    return item.mediaGroup['media:thumbnail'][0]?.$.url || '';
  }

  const media = item.media?.thumbnail?.url;
  if (media) return media;

  const enclosure = item.enclosure?.url;
  if (enclosure) return enclosure;

  const content = item.contentEncoded || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : '';
}

export async function parseFeed(url: string): Promise<RssItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item: any) => {
      const title = item.title ?? 'Untitled';
      const link = item.link ?? '';
      const id = item.guid || link || title;
      
      const raw = item.contentEncoded || item.content || item.description || item.contentSnippet || '';
      const author = item.creator || item.author || feed.title || '';
      const published = item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString());
      const content = stripHtml(raw);

      return {
        id,
        title,
        summary: content.slice(0, 300),
        content: content.slice(0, 10000), // Substantially more content for "text-rich" posts
        link,
        author,
        published,
        thumbnail: pickThumbnail(item)
      };
    });
  } catch (error) {
    console.error(`Error parsing feed ${url}:`, error);
    return [];
  }
}
