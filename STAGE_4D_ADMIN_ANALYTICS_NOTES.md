# Stage 4D: Admin Analytics

Adds a frontend-safe analytics module.

Files included:
- artifacts/unibridge/src/lib/admin-analytics.ts
- artifacts/unibridge/src/pages/moderation-analytics.tsx

Manual App.tsx step:

```tsx
import ModerationAnalytics from "@/pages/moderation-analytics";
```

Inside `<Switch>`, add:

```tsx
<Route path="/moderation/analytics" component={ModerationAnalytics} />
```

Optional: link a card or button in `/moderation` to `/moderation/analytics`.

No backend/API changes required.
