# Stage 7B.2 — Comment UI Click Fix

Fixes:
- Smaller comment vote pills
- No oversized pale vote block on comments
- Comment author names now link to `/u/:slug`
- Post author names also link to `/u/:slug`
- Reply button now activates reply mode
- Save button toggles Saved
- Report button toggles Reported
- Cleaner comment card alignment

Files:
- `artifacts/unibridge/src/components/vote-buttons.tsx`
- `artifacts/unibridge/src/pages/post-detail.tsx`

Push:
```powershell
git add .
git commit -m "Fix comment actions and author links"
git push
```
