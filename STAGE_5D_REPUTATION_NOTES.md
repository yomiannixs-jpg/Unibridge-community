# Stage 5D: Reputation and Badges

Adds a local-first reputation system for CollegeDiscourse.

Files added:
- artifacts/unibridge/src/lib/reputation.ts
- artifacts/unibridge/src/pages/reputation.tsx

Add to App.tsx:

import ReputationPage from "@/pages/reputation";

Inside <Switch>:

<Route path="/reputation" component={ReputationPage} />

Optional: add a sidebar link to /reputation.
