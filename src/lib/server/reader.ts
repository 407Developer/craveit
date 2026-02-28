import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';

export async function fetchFullArticle(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) return null;

    const html = await response.text();
    // linkedom provides a lightweight DOM implementation
    const { document } = parseHTML(html);
    
    // Readability needs a document or a Node
    const reader = new Readability(document as unknown as Document);
    const article = reader.parse();

    if (!article) return null;

    return {
      title: article.title || 'Untitled',
      content: article.textContent?.trim() || '',
      html: article.content || '',
      excerpt: article.excerpt || '',
      byline: article.byline || '',
      siteName: article.siteName || ''
    };
  } catch (error) {
    console.error(`Error fetching full article ${url}:`, error);
    return null;
  }
}
