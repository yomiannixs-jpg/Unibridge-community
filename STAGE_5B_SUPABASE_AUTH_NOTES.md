# Stage 5B — Supabase Auth Bridge

This stage upgrades CollegeDiscourse auth from local-only to Supabase-ready without adding dependencies.

## Files changed

- `artifacts/unibridge/src/lib/auth-context.tsx`
- `artifacts/unibridge/src/pages/auth.tsx`

## What it adds

- Supabase email/password login via Supabase Auth REST API
- Supabase signup via Supabase Auth REST API
- Local fallback if Supabase env variables are missing
- Demo login still works in fallback mode
- Auth page displays whether Supabase or Local mode is active

## Required Vercel frontend environment variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## No backend/API route changes

Render backend is not changed in this stage.

## Test routes

- `/auth`
- `/login`
- `/profile`
- `/account/settings`
