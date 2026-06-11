# CollegeDiscourse Stage 3A Stable Auth/Profile Build

This build adds the auth/profile UI while avoiding the routing break that previously caused white pages.

## Changes
- Keeps existing working routes and adds `/auth`, `/login`, and `/profile`.
- Uses Wouter without a custom `base` value to avoid Vercel route base issues.
- Adds Vercel SPA rewrite at `artifacts/unibridge/vercel.json`.
- Keeps backend API routes unchanged for stability.
- Preserves CollegeDiscourse / SubDiscourse visible branding and blue/red theme.

## Test URLs
- `/`
- `/auth`
- `/login`
- `/profile`
- `/hubs`
- `/d/scholarships`
- `/messages`
- `/resources`
- `/moderation`
