# Stage 7B.1 — Post Detail Slug Fix

Fixes:
- Home Feed links now match post detail slugs.
- `/posts/research-question` works.
- `/posts/scholarship-warning` works.
- `/posts/phd-email` works.
- `/posts/study-abroad-budget` works.
- `/posts/programming-ai` works.
- Uses a shared demo post store so Home and Post Detail always agree.

Files:
- `artifacts/unibridge/src/lib/demo-posts-store.ts`
- `artifacts/unibridge/src/pages/home.tsx`
- `artifacts/unibridge/src/pages/post-detail.tsx`

No App.tsx change required if this exists:
```tsx
<Route path="/posts/:id" component={PostDetail} />
```

Push:
```powershell
git add .
git commit -m "Fix post detail slug routing"
git push
```
