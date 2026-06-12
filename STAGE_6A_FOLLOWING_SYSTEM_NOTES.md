# CollegeDiscourse Stage 6A — Following System

Added frontend-only local-storage following system.

Files included:
- artifacts/unibridge/src/lib/follow-store.ts
- artifacts/unibridge/src/pages/followers.tsx
- artifacts/unibridge/src/pages/following.tsx

After copying, add these imports to App.tsx:

import FollowersPage from "@/pages/followers";
import FollowingPage from "@/pages/following";

Inside <Switch>, add:

<Route path="/followers" component={FollowersPage} />
<Route path="/following" component={FollowingPage} />

Optional: add sidebar links in layout.tsx:
- /followers
- /following

No backend/API changes required.
