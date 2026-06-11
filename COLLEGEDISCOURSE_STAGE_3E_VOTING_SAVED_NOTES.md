# CollegeDiscourse Stage 3E — Persistent Voting and Saved Posts

This build adds safer voting and saved-post behavior while preserving the working CollegeDiscourse frontend and Render backend.

## Added
- Local duplicate-vote prevention
- Saved Posts page at `/saved`
- Sidebar navigation link for Saved Posts
- Saved state sync with local storage
- Voting/saving continues to call the Render API
- Safe fallback behavior if Render/database is offline

## Test after deployment
- Upvote a post once; the second click should not keep inflating votes.
- Save a post from Home or Post Detail.
- Visit `/saved` and confirm saved posts appear.
- Unsave a post and confirm it leaves the Saved page.
