# Stage 6E — Presence Indicators

Added:
- Presence page at `/presence`
- Online / away / offline statuses
- Last-seen labels
- Current room labels
- Typing indicators
- Set your own status
- Local-storage persistence
- Backend-ready presence structure

Files:
- `artifacts/unibridge/src/lib/presence-store.ts`
- `artifacts/unibridge/src/pages/presence.tsx`

App.tsx changes:
```tsx
import PresencePage from "@/pages/presence";
```

Inside `<Switch>`:
```tsx
<Route path="/presence" component={PresencePage} />
```

Optional sidebar link:
```tsx
{ href: "/presence", label: "Presence", icon: Radio },
```

Push:
```powershell
git add .
git commit -m "Stage 6E presence indicators"
git push
```
