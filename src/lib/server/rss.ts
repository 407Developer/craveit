import Parser from 'rss-parser';

export type RssItem = {
  id: string;
  title: string;
  summary: string;
  link: string;
  author: string;
  published: string;
  thumbnail: string;
};

const parser: Parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'craveit/0.1'
  }
});

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, '').trim();
}

function pickThumbnail(item: Parser.Item) {
  const media = (item as any).media?.thumbnail?.url;
  if (media) return media;

  const enclosure = (item as any).enclosure?.url;
  if (enclosure) return enclosure;

  const content = item.content || (item as any)['content:encoded'] || '';
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : '';
}

export async function parseFeed(url: string): Promise<RssItem[]> {
  const feed = await parser.parseURL(url);
  return (feed.items || []).map((item) => {
    const title = item.title ?? 'Untitled';
    const link = item.link ?? '';
    const id = item.guid || link || title;
    const summary = item.contentSnippet || item.summary || item.content || '';
    const author = item.creator || item.author || feed.title || '';
    const published = item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString());

    return {
      id,
      title,
      summary: stripHtml(summary).slice(0, 260),
      link,
      author,
      published,
      thumbnail: pickThumbnail(item)
    };
  });
}
