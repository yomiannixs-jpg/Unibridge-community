# Stage 6I.5 — Direct Messages Avatar/Name Fix

Fixes:
- Direct message thread list now shows names, handles, roles, and message previews.
- No more blank blue avatar circles.
- No more `NaNd ago`.
- Adds safe fallback for older localStorage message data.
- Adds “Reset demo inbox” button to clear old broken localStorage DM data.

After deployment:
1. Go to `/messages`.
2. Click `Reset demo inbox` once if old blank message data still appears.
3. Then refresh.

Push:
```powershell
git add .
git commit -m "Fix direct message avatars and timestamps"
git push
```
