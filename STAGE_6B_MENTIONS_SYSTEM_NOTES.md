# Stage 6B — Mentions System

Added:
- Mentions page at `/mentions`
- Mention storage helper
- Unread/read mention states
- Mark one mention as read
- Mark all mentions as read
- Clear read mentions
- Seed mention examples
- Backend-ready mention extraction helper

App.tsx changes required:

```tsx
import MentionsPage from "@/pages/mentions";
```

Inside `<Switch>`:

```tsx
<Route path="/mentions" component={MentionsPage} />
```

Optional sidebar link in `layout.tsx`:

```tsx
{ href: "/mentions", label: "Mentions", icon: AtSign },
```

and import `AtSign` from `lucide-react`.

Push:

```powershell
git add .
git commit -m "Stage 6B mentions system"
git push
```
