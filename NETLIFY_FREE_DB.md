# Netlify + Free Database Plan

## Recommendation
Use **Supabase (free Postgres)** as the persistent comments database and deploy app + API routes on Netlify.

Why this stack:
- Free tier is enough for MVP comments.
- Works cleanly with SvelteKit server routes.
- Comments survive redeploy/restarts (unlike in-memory storage).

## Current State
- Comments currently use in-memory storage (`src/lib/server/comments.ts`).
- This is good for UI/testing, but data resets on restart.

## Deployment (Netlify)
1. Push this repo to GitHub.
2. In Netlify: `New site from Git` and select repo.
3. Build command: `pnpm build`
4. Publish directory: `.svelte-kit/netlify` (or leave default if auto-detected)
5. Add environment variables in Netlify UI:
   - `YOUTUBE_API_KEY`
   - future DB vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

## Free DB Setup (Supabase)
1. Create free Supabase project.
2. Create `comments` table:
   - `id` (uuid pk)
   - `item_id` (text)
   - `parent_id` (uuid nullable)
   - `author_handle` (text)
   - `display_name` (text)
   - `body` (text)
   - `created_at` (timestamptz default now())
   - `upvotes` (int default 0)
   - `official` (bool default false)
   - `pinned` (bool default false)
3. Add index on `item_id` and `created_at`.
4. Add RLS policies (read all, write authenticated or controlled API role).

## Integration Path
1. Replace in-memory functions in `src/lib/server/comments.ts` with Supabase queries.
2. Keep the same API contract in `src/routes/api/comments/+server.ts`.
3. Keep the same UI component (`src/lib/components/CommentsThread.svelte`).

This keeps your frontend untouched while upgrading persistence.
