import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const YT_CHANNEL_REGEX = /(?:youtube\.com\/channel\/)([a-zA-Z0-9_-]+)/i;
const YT_HANDLE_REGEX = /youtube\.com\/@([a-zA-Z0-9_.-]+)/i;
const YT_PLAYLIST_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/i;
const YT_CHANNEL_ID_REGEX = /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/i;

function extractYouTubeChannelIdFromHtml(html: string) {
  const match = html.match(/"channelId"\s*:\s*"(UC[^"]+)"/i);
  return match ? match[1] : '';
}

function extractChannelIdFromAuthorUrl(authorUrl: string) {
  const match = authorUrl.match(YT_CHANNEL_ID_REGEX);
  return match ? match[1] : '';
}

function normalizeYouTubeHandle(input: string) {
  const fromUrl = input.match(YT_HANDLE_REGEX);
  if (fromUrl) return fromUrl[1];
  const trimmed = input.trim();
  if (trimmed.startsWith('@')) return trimmed.slice(1);
  return trimmed;
}

function normalizeRedditSubreddit(input: string) {
  const urlMatch = input.match(/reddit\.com\/r\/([a-zA-Z0-9_]+)/i);
  if (urlMatch) return urlMatch[1];
  const clean = input.replace(/^r\//i, '').trim();
  return clean;
}

export const POST: RequestHandler = async ({ request }) => {
  const payload = (await request.json()) as {
    kind?: 'youtube_channel' | 'youtube_playlist' | 'reddit_subreddit' | 'website_rss';
    input?: string;
  };

  if (!payload.kind || !payload.input) {
    return json({ success: false, error: 'Missing kind or input' }, { status: 400 });
  }

  const input = payload.input.trim();

  if (payload.kind === 'youtube_channel') {
    const direct = input.match(YT_CHANNEL_REGEX);
    if (direct) {
      return json({
        success: true,
        url: `https://www.youtube.com/feeds/videos.xml?channel_id=${direct[1]}`
      });
    }

    const handle = normalizeYouTubeHandle(input);
    if (!handle) {
      return json({ success: false, error: 'Please paste a YouTube channel link' }, { status: 400 });
    }

    try {
      const oembedUrl = new URL('https://www.youtube.com/oembed');
      oembedUrl.searchParams.set('format', 'json');
      oembedUrl.searchParams.set('url', `https://www.youtube.com/@${handle}`);
      const oembedResponse = await fetch(oembedUrl.toString());
      if (oembedResponse.ok) {
        const data = await oembedResponse.json();
        const authorUrl = typeof data.author_url === 'string' ? data.author_url : '';
        const channelId = extractChannelIdFromAuthorUrl(authorUrl);
        if (channelId) {
          return json({
            success: true,
            url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
          });
        }
      }

      const response = await fetch(`https://www.youtube.com/@${handle}`);
      if (response.ok) {
        const html = await response.text();
        const channelId = extractYouTubeChannelIdFromHtml(html);
        if (channelId) {
          return json({
            success: true,
            url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
          });
        }
      }
    } catch (error) {
      return json(
        { success: false, error: 'YouTube did not respond. Try again or paste a channel link.' },
        { status: 400 }
      );
    }

    return json(
      {
        success: false,
        error:
          'Could not find the channel ID. Paste a channel link like https://www.youtube.com/channel/UC...'
      },
      { status: 400 }
    );
  }

  if (payload.kind === 'youtube_playlist') {
    const playlist = input.match(YT_PLAYLIST_REGEX);
    if (!playlist) {
      return json({ success: false, error: 'Please paste a playlist link' }, { status: 400 });
    }
    return json({
      success: true,
      url: `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlist[1]}`
    });
  }

  if (payload.kind === 'reddit_subreddit') {
    const subreddit = normalizeRedditSubreddit(input);
    if (!subreddit) {
      return json({ success: false, error: 'Please type a subreddit name' }, { status: 400 });
    }
    return json({
      success: true,
      url: `https://openrss.org/feeds/reddit/r/${subreddit}`
    });
  }

  if (payload.kind === 'website_rss') {
    return json({ success: true, url: input });
  }

  return json({ success: false, error: 'Unsupported type' }, { status: 400 });
};
