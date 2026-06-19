$file = "artifacts\unibridge\src\lib\user-profiles-store.ts"

$text = Get-Content $file -Raw

if ($text -notmatch "const demoStudentProfile") {
$insert = @'

const demoStudentProfile: PublicUserProfile = {
  id: "demo-student",
  name: "Demo Student",
  handle: "@demostudent",
  avatar: "DS",
  role: "Graduate Applicant",
  reputation: 240,
  following: false,
  slug: "demostudent",
  country: "Nigeria",
  institution: "CollegeDiscourse Community",
  field: "Education and Research",
  bio: "Exploring scholarships, research support, and study-abroad opportunities on CollegeDiscourse.",
  interests: ["Scholarships", "Research Help", "Study Abroad"],
  skills: ["Writing", "Research", "Applications"],
  joinedRooms: ["Research Help", "Scholarships", "Study Abroad"],
  posts: 18,
  comments: 92,
  joinedDate: "2026-01-01T10:00:00.000Z",
  followersCount: 24,
  followingCount: 13,
  awards: ["✨", "🎓"],
  achievements: ["Verified User", "Rising Member"],
  bannerGradient: "from-blue-700 via-indigo-700 to-slate-900",
};

'@

$text = $text -replace "export function loadPublicProfiles\(\)", "$insert`nexport function loadPublicProfiles()"
}

$text = $text -replace "const people = \[\.\.\.social\.followers, \.\.\.social\.following\]\.filter\(", "const people = [demoStudentProfile, ...social.followers, ...social.following].filter("

$text = [regex]::Replace($text, "export function getPublicProfile\(slug: string\) \{[\s\S]*?\n\}", @'
export function getPublicProfile(slug: string) {
  const normalized = slugifyUser(slug);

  if (["you", "demo-student", "demostudent", "ds"].includes(normalized)) {
    return demoStudentProfile;
  }

  return loadPublicProfiles().find(
    (profile) =>
      profile.slug === normalized ||
      slugifyUser(profile.name) === normalized ||
      slugifyUser(profile.handle.replace("@", "")) === normalized,
  );
}
'@)

Set-Content $file $text -Encoding UTF8

Write-Host "Done: DemoStudent public profile lookup patched."
