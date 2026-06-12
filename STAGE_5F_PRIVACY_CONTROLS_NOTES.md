# Stage 5F: Account Settings and Privacy Controls

Adds:
- /privacy page
- Profile visibility settings
- Show/hide reputation, joined hubs, saved posts, and activity history
- Direct message preference
- Email/reply/mention notification preferences
- Digest frequency setting
- Reset defaults
- Local-storage persistence

Add to App.tsx:

import PrivacySettingsPage from "@/pages/privacy";

Inside <Switch>:

<Route path="/privacy" component={PrivacySettingsPage} />
