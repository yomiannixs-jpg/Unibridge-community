# Stage 6H — Live Notification Center Integration

Added:
- Unified notification hub
- Notification Center at existing `/notifications`
- Mentions notifications
- Direct message notifications
- Follow/follower notifications
- Reputation notifications
- Active room notifications
- Filters by notification type
- Mark one/read all
- Local-storage read state
- Backend-ready structure

Files:
- `artifacts/unibridge/src/lib/notification-hub.ts`
- `artifacts/unibridge/src/pages/notifications.tsx`

No App.tsx changes required because `/notifications` already exists.

Push:
```powershell
git add .
git commit -m "Stage 6H live notification center"
git push
```
