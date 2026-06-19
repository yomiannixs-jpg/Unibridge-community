# Stage 8A — Community Flair, Cake Day, and Contributor Identity

Added:
- Community flair badges
- Cake day / joined-date badge
- Verified badge
- Mentor badge
- Moderator badge
- Top Contributor ribbon
- Trusted Contributor ribbon
- Leaderboard page

Files:
- `artifacts/unibridge/src/components/user-identity.tsx`
- `artifacts/unibridge/src/pages/leaderboard.tsx`
- `STAGE_8A_MANUAL_ROUTE_AND_COMMENT_NOTES.md`

Manual App.tsx route needed:
```tsx
import LeaderboardPage from "@/pages/leaderboard";
<Route path="/leaderboard" component={LeaderboardPage} />
```

Optional sidebar item:
```tsx
{ href: "/leaderboard", label: "Leaderboard", icon: Crown },
```

Push:
```powershell
git add .
git commit -m "Stage 8A community flair and leaderboard"
git push
```
