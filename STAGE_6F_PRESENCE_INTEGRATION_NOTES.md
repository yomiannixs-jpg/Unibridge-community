# Stage 6F — Presence Integration

This package makes presence visible inside Direct Messages.

## Added

- Reusable `PresenceBadge`
- Reusable `PresenceDot`
- Online/away/offline dots in message thread list
- Presence badge in conversation header
- Typing indicator in message threads
- No App.tsx changes required

## Files

- `artifacts/unibridge/src/components/presence-badge.tsx`
- `artifacts/unibridge/src/pages/messages.tsx`

## Requirements

This depends on Stage 6E:
- `artifacts/unibridge/src/lib/presence-store.ts`

## Push

```powershell
git add .
git commit -m "Stage 6F presence integration"
git push
```
