# Backend Integration Notes

The UI calls SvelteKit server routes under `src/routes/api/*`. The backend is now **RSS-first** so you can avoid paid APIs.

## Current API Routes
- `GET /api/feed?source=&category=&mediaType=&cursor=&focus=1`
  - Returns `{ items: FeedItem[], nextCursor: string | null }`.
  - Query params are repeatable: `source=youtube&source=reddit`.
  - `focus=1` strips outbound URLs in the response.
- `GET /api/sources`
  - Returns available sources and the current RSS sources.
- `POST /api/sources`
  - Adds a new RSS source.
- `DELETE /api/sources`
  - Removes an RSS source by `id`.
- `GET /api/filters`
  - Returns category list + media types.

## Where To Plug In Real Logic
- RSS parser: `src/lib/server/rss.ts` (uses `rss-parser`)
- RSS fetcher + normalizer: `src/lib/server/providers/rss.ts`
- Source registry (in-memory for now): `src/lib/server/sources.ts`
- Feed endpoint: `src/routes/api/feed/+server.ts`

## Environment Variables
None required for RSS feeds.

## Next Steps (if you add paid APIs later)
1. Add OAuth flows inside `POST /api/auth/:provider`.
2. Store tokens (DB or secure session).
3. Expand pagination + cursor handling in `GET /api/feed`.

## Focus Mode
Focus mode is a client-side toggle in `src/lib/stores.svelte.ts` and is also enforced on the server with `focus=1`.
