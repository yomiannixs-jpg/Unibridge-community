# Stage 6D.1 — Direct Chat Room URLs Fix

This package fixes direct room URLs like:

- `/rooms/research-help`
- `/rooms/phd-admissions`
- `/rooms/scholarships`
- `/rooms/study-abroad`
- `/rooms/programming-ai`
- `/rooms/career-launch`

## Files

- `artifacts/unibridge/src/pages/rooms.tsx`

## App.tsx changes required

Add this route ABOVE `/rooms`:

```tsx
<Route path="/rooms/:slug" component={RoomsPage} />
<Route path="/rooms" component={RoomsPage} />
```

## Push

```powershell
git add .
git commit -m "Stage 6D1 direct chat room routes"
git push
```
