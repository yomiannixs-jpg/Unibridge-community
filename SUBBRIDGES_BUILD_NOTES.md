# SubBridge Build Notes

This build adds the first real SubBridge backend layer and connects the frontend SubBridge listing/detail page to the Render API.

## Backend additions

New/updated files:

- `artifacts/api-server/src/routes/subbridges.ts`
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/app.ts`

New backend endpoints:

- `GET /` — backend status landing JSON
- `GET /api/healthz`
- `GET /api/subbridges`
- `GET /api/communities` — compatibility alias
- `POST /api/subbridges`
- `GET /api/subbridges/:slug`
- `GET /api/communities/:slug` — compatibility alias
- `GET /api/subbridges/:slug/posts`
- `GET /api/communities/:slug/posts` — compatibility alias
- `POST /api/subbridges/:slug/join`
- `DELETE /api/subbridges/:slug/leave`
- `GET /api/feed`

## Frontend additions

New/updated files:

- `artifacts/unibridge/src/lib/api.ts`
- `artifacts/unibridge/src/pages/community.tsx`

The frontend now tries to load SubBridges from:

```text
${VITE_API_URL}/api/subbridges
```

and posts for each SubBridge from:

```text
${VITE_API_URL}/api/subbridges/:slug/posts
```

If the API is unavailable, the page falls back to the existing local seeded store.

## Render backend settings

Root directory:

```text
artifacts/api-server
```

Build command:

```bash
pnpm install --no-frozen-lockfile && pnpm run build
```

Start command:

```bash
pnpm start
```

Environment variables:

```env
DATABASE_URL=your_supabase_database_url
PORT=3000
BASE_PATH=/
NODE_VERSION=20
```

## Vercel frontend settings

Root directory:

```text
artifacts/unibridge
```

Install command:

```bash
pnpm install --no-frozen-lockfile
```

Build command:

```bash
pnpm build
```

Output directory:

```text
dist/public
```

Environment variables:

```env
PORT=3000
BASE_PATH=/
VITE_API_URL=https://unibridge-community.onrender.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## Test URLs after Render deploy

```text
https://unibridge-community.onrender.com/
https://unibridge-community.onrender.com/api/healthz
https://unibridge-community.onrender.com/api/subbridges
https://unibridge-community.onrender.com/api/communities
https://unibridge-community.onrender.com/api/feed
https://unibridge-community.onrender.com/api/subbridges/scholarships
https://unibridge-community.onrender.com/api/subbridges/scholarships/posts
```

## Note

The SubBridge route currently uses seeded in-memory data so you can confirm frontend-backend communication immediately. The next production step is to add persistent Supabase/Postgres tables for `subbridges`, `subbridge_members`, and `subbridge_posts`.
