# Stage 6C — Direct Messages

Added:
- Direct Messages UI on `/messages`
- Conversation threads
- Message composer
- Send message locally
- Mark thread read when opened
- Unread count badges
- Local-storage persistence
- Backend-ready data structure

Files:
- `artifacts/unibridge/src/lib/dm-store.ts`
- `artifacts/unibridge/src/pages/messages.tsx`

No App.tsx route change required if `/messages` already exists.

Push:
```powershell
git add .
git commit -m "Stage 6C direct messages"
git push
```
