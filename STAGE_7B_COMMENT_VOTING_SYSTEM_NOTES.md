# Stage 7B — Comment Voting System

Added:
- Post detail page with full post body
- Reddit-style vote controls on comments
- Vote persistence using existing vote store
- Add-comment form
- Local comments
- Comment action buttons: Reply, Save, Report
- Better `/posts/:id` behavior for Stage 7A feed links

Files:
- `artifacts/unibridge/src/pages/post-detail.tsx`

No App.tsx change required if `/posts/:id` already exists.

Push:
```powershell
git add .
git commit -m "Stage 7B comment voting system"
git push
```
