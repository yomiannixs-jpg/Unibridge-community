# UniBridge Community Pivot

This build turns the original UniBridge app into an education-community product inspired by subbridge-style education communities.

## Core product direction

UniBridge is now organized around education communities such as:

- c/scholarships
- c/study-abroad
- c/research-help
- c/phd-admissions
- c/career-launch

## Added MVP features

- subbridge-style home feed
- Community directory
- Community detail pages at `/c/:slug`
- Create-post flow
- Post detail page
- Comments and nested replies UI
- Upvote and saved-post interactions
- Group chat/messages page
- Resource library
- Moderation center
- LocalStorage-backed demo persistence

## Vercel configuration

Use the frontend project:

```text
Root Directory: artifacts/unibridge
Framework Preset: Vite
Install Command: pnpm install
Build Command: pnpm build
Output Directory: dist/public
```

Environment variables:

```env
PORT=3000
BASE_PATH=/
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## Production database direction

The current build is a working frontend community MVP using LocalStorage for quick deployment and testing. For production, connect these screens to Supabase tables:

- users
- communities
- community_members
- posts
- comments
- votes
- saved_posts
- messages
- notifications
- reports
- moderators
- resources
