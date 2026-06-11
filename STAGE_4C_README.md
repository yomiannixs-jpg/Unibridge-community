# Stage 4C Auto Moderation

Adds:
- `/moderation/auto` page
- auto-moderation settings
- blocked words and flagged patterns
- scam scholarship detection
- paid-agent solicitation detection
- content test panel
- local-storage persistence

Manual App.tsx step:

```tsx
import ModerationAuto from "@/pages/moderation-auto";
```

Add inside `<Switch>`:

```tsx
<Route path="/moderation/auto" component={ModerationAuto} />
```
