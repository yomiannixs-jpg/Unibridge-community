# Stage 3A — Auth and User Profiles

This build adds the first real identity layer for CollegeDiscourse.

## Added

- Local/demo authentication context with login, signup, logout, and profile update support.
- `/auth` route for login and signup.
- `/profile` route for a user profile dashboard.
- Profile editing: display name, location, and bio.
- User reputation, joined SubDiscourses, and saved posts sections.
- Header login/profile button.
- Profile navigation in the sidebar.
- Post creation now uses the logged-in user's display name and role when available.
- `/d/:slug` frontend route is supported while `/c/:slug` remains available for compatibility.
- CollegeDiscourse and SubDiscourse visible branding is applied.
- Blue/red theme polish and remaining orange styling cleanup.

## Deployment

Frontend remains on Vercel:

- Root Directory: `artifacts/unibridge`
- Install Command: `corepack enable && corepack prepare pnpm@10 --activate && pnpm install --no-frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist/public`

Backend remains on Render:

- Root Directory: `artifacts/api-server`
- Build Command: `pnpm install --no-frozen-lockfile && pnpm run build`
- Start Command: `pnpm start`

## Important

This stage uses a local/demo auth store so the product can be tested immediately. The next stage should replace this with Supabase Auth and database-backed profiles.
