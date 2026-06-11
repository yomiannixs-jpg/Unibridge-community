# SubBridge Phase II Build

This build extends the SubBridge community layer beyond static community listing.

## Backend additions

New/expanded Render API endpoints:

- `GET /api/feed` with optional `search` and `subbridge` query parameters
- `GET /api/search?q=` for cross-searching SubBridges and posts
- `POST /api/subbridges/:slug/posts` to create a SubBridge post
- `POST /api/subbridge-posts/:id/upvote`
- `POST /api/subbridge-posts/:id/downvote`
- `POST /api/subbridge-posts/:id/save`
- `GET /api/subbridge-posts/:id/comments`
- `POST /api/subbridge-posts/:id/comments`
- `GET /api/saved-posts`
- `GET /api/reputation/leaderboard`
- `GET /api/moderation/queue`
- `POST /api/reports`
- `PATCH /api/moderation/reports/:id/resolve`
- `GET /api/messages/channels`

The backend still uses in-memory demo data for fast deployment. For production, these routes should be connected to Supabase/Postgres tables.

## Frontend additions

- Home feed now syncs with `/api/feed`.
- Search box added to the home feed.
- Voting now calls the Render backend.
- Saved-post action now calls the Render backend.
- Create-post page now calls `POST /api/subbridges/:slug/posts` before falling back locally.
- Post-detail page now loads comments from Render and posts comments back to Render.

## Deployment reminders

Frontend Vercel env:

```env
PORT=3000
BASE_PATH=/
VITE_API_URL=https://unibridge-community.onrender.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Render backend env:

```env
DATABASE_URL=your_supabase_postgres_connection_string
PORT=3000
BASE_PATH=/
NODE_VERSION=20
```

