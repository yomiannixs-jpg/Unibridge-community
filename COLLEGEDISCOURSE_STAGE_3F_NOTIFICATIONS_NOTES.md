# CollegeDiscourse Stage 3F: Notifications

This build adds a safe notification layer without changing Render routes or database structure.

## Added

- Notification bell dropdown in the header
- Unread notification counter
- Notification Center page at `/notifications`
- Mark all read
- Clear notifications
- Notifications for:
  - Post votes
  - Saved/unsaved posts
  - New comments
  - Seeded Hub activity alerts
- Local-storage persistence
- API-ready architecture for later backend notification persistence

## Notes

This build intentionally keeps notifications local-first. Stage 3F should not destabilize the working backend because it does not require new database migrations or new Render routes.

Later, notifications can be moved to the backend using a table such as `cd_notifications`.
