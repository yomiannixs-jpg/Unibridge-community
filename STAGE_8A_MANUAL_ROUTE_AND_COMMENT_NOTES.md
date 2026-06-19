# Stage 8A manual import notes

To show identity badges directly inside comments, open:

`artifacts/unibridge/src/pages/post-detail.tsx`

Add this import near the top:

```tsx
import { ContributorRibbon, IdentityBadges } from "@/components/user-identity";
```

Then inside each comment header, immediately after the karma badge, add:

```tsx
<ContributorRibbon name={comment.author} />
<IdentityBadges name={comment.author} />
```

This is optional. The full Stage 8A files already add:
- user identity component
- leaderboard page

To add route, open `App.tsx` and add:

```tsx
import LeaderboardPage from "@/pages/leaderboard";
```

Then inside `<Switch>` add:

```tsx
<Route path="/leaderboard" component={LeaderboardPage} />
```

For sidebar, open `Layout.tsx`, import `Crown` from lucide-react, and add:

```tsx
{ href: "/leaderboard", label: "Leaderboard", icon: Crown },
```
