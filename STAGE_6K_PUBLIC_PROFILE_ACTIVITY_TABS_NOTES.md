# Stage 6K — Public Profile Activity Tabs

Added to public profiles:
- Posts tab
- Replies tab
- Rooms tab
- Reputation tab
- People tab
- Profile activity content
- Reputation history
- Posts/replies cards
- Related people preview

No App.tsx change required if Stage 6J route already exists:
```tsx
<Route path="/u/:slug" component={PublicProfilePage} />
```

Push:
```powershell
git add .
git commit -m "Stage 6K public profile activity tabs"
git push
```
