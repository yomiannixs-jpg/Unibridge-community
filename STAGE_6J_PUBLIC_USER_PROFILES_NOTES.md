# Stage 6J — Public User Profiles

Added:
- Public profile pages at `/u/:slug`
- Clickable people cards from `/followers`
- Profile details, bio, interests, skills, rooms
- Presence badge on public profiles
- Follow/unfollow button on public profiles
- Message button leading to `/messages`

App.tsx changes:
```tsx
import PublicProfilePage from "@/pages/public-profile";
```

Inside `<Switch>`:
```tsx
<Route path="/u/:slug" component={PublicProfilePage} />
```

Push:
```powershell
git add .
git commit -m "Stage 6J public user profiles"
git push
```
