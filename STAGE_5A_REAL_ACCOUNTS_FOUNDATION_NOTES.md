# Stage 5A: Real Accounts Foundation

Added:
- Improved local-first auth context
- Signup/login/logout flow
- Account settings page at `/account/settings`
- Editable name, email display, and bio
- Role badge and reputation groundwork
- Joined SubDiscourses and saved posts attached to user profile
- Supabase-ready structure, but no backend/API breaking changes

After copying into Uni-Bridge 2, add this route in App.tsx:

```tsx
import AccountSettings from "@/pages/account-settings";
```

Inside `<Switch>` add:

```tsx
<Route path="/account/settings" component={AccountSettings} />
```
