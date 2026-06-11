# CollegeDiscourse Stage 4B: Moderator Roles and User Controls

This package adds a frontend-safe moderation user-controls module.

Added:
- Role system: Super Admin, Moderator, Mentor, Verified User, Regular User
- User controls page component
- Promote/demote users
- Warn, mute, ban, restore users
- Role and status badges
- Moderator statistics
- Local-storage persistence

Important:
To make the page accessible, add the route below to `artifacts/unibridge/src/App.tsx`:

import ModerationUsers from "@/pages/moderation-users";

<Route path="/moderation/users" component={ModerationUsers} />

If your moderation dashboard has cards, link the Users/Moderators card to `/moderation/users`.

No backend/API route changes are required.
