# Stage 6D — Community Chat Rooms

Added:
- Chat rooms page at `/rooms`
- Room list with categories
- Main room chat window
- Send message form
- Online users sidebar
- Room statistics
- Local-storage persistence
- Backend-ready structure

Files:
- `artifacts/unibridge/src/pages/rooms.tsx`
- `artifacts/unibridge/src/lib/chat-rooms-store.ts`

App.tsx changes required:
```tsx
import RoomsPage from "@/pages/rooms";
```

Inside `<Switch>`:
```tsx
<Route path="/rooms" component={RoomsPage} />
```

Optional sidebar item:
```tsx
{ href: "/rooms", label: "Chat Rooms", icon: Hash },
```

Push:
```powershell
git add .
git commit -m "Stage 6D community chat rooms"
git push
```
