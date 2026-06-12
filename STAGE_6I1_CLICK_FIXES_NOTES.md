# Stage 6I.1 Click Fixes

Fixes included:
- Sidebar now clearly shows Chat Rooms and Manage Rooms.
- Cleaned layout imports and missing commas.
- Room cards should be clickable once `rooms.tsx` is replaced or manually patched.

IMPORTANT App.tsx route order:
```tsx
<Route path="/rooms/manage" component={RoomsManagePage} />
<Route path="/rooms/:slug" component={RoomsPage} />
<Route path="/rooms" component={RoomsPage} />
```

After copying:
```powershell
git add .
git commit -m "Fix room sidebar and route behavior"
git push
```
