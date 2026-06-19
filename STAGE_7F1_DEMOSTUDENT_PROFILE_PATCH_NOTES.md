# Stage 7F.1 — DemoStudent Profile Mention Fix

This patch fixes the issue where clicking `@DemoStudent` opens:

`Profile not found`

It adds Demo Student to the public profile lookup system so these routes work:

- `/u/demostudent`
- `/u/demo-student`
- `/u/you`

## Run from project root

```powershell
powershell -ExecutionPolicy Bypass -File .\FIX_DEMOSTUDENT_PROFILE.ps1
```

Then:

```powershell
git add .
git commit -m "Fix DemoStudent public profile lookup"
git push
```
