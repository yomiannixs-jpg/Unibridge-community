# Stage 3B: Join / Leave SubDiscourse

This build adds safe local-storage community membership behavior without changing backend routes.

## Added

- Join / leave button on each `d/:slug` SubDiscourse page.
- Joined badge on SubDiscourse cards.
- Member count increments/decrements locally when joining/leaving.
- Profile page membership buttons now sync with local store.
- Home feed filter buttons show `· Joined` for joined SubDiscourses.
- Full 15-Hub seed list restored with robust local-storage merging.

## Notes

- Backend APIs are unchanged for safety.
- Existing `/api/subbridges` and `/api/feed` routes remain valid.
- Local storage remains the source of truth for this stage.
