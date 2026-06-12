# Stage 5E: User Activity History

Adds a local-first activity history page at `/activity`.

## Files included
- `artifacts/unibridge/src/pages/activity.tsx`
- `artifacts/unibridge/src/lib/user-activity.ts`

## Add route in App.tsx

```tsx
import ActivityPage from "@/pages/activity";
```

Inside `<Switch>`:

```tsx
<Route path="/activity" component={ActivityPage} />
```

## Optional sidebar link in layout.tsx
Add a link to `/activity` labelled `Activity`.
