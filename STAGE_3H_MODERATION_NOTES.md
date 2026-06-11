# CollegeDiscourse Stage 3H: Moderation Tools

This build adds local-first moderation tools without changing backend/API routes.

## Added

- Moderation dashboard at the existing `/moderation` route
- Report queue with Open, Reviewing, Resolved, and Dismissed statuses
- Manual report creation form
- Clear resolved reports action
- Moderation checklist storage
- Local storage persistence
- Event-based state sync

## Files included

- `artifacts/unibridge/src/lib/moderation-store.ts`
- `artifacts/unibridge/src/pages/moderation.tsx`

## Safe behavior

This is frontend-only and does not require Render database changes.
