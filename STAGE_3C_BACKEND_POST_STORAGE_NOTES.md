# Stage 3C — Backend Post Storage

This build adds conservative backend-backed post/comment persistence for CollegeDiscourse.

## What changed

- New posts posted from `/create` are sent to Render using `/api/subbridges/:slug/posts`.
- Render API stores new posts in PostgreSQL tables if `DATABASE_URL` is available.
- The API auto-creates two lightweight tables if missing:
  - `cd_posts`
  - `cd_comments`
- If PostgreSQL is unavailable, the API safely falls back to in-memory seed data.
- `/api/feed` now prefers stored database posts.
- `/api/subbridges/:slug/posts` now prefers stored database posts.
- `/api/subbridge-posts/:id/comments` now prefers stored database comments.
- Upvotes/downvotes are persisted when the post exists in the database.

## Important

This build does not change Vercel routing, layout, or frontend navigation. It is intentionally focused on persistence only.

## Test after deploy

1. Open the app.
2. Create a new post.
3. Return to the home feed.
4. Refresh the page.
5. Confirm the post remains visible.
6. Open Render API directly:
   - `/api/feed`
   - `/api/subbridges/scholarships/posts`

