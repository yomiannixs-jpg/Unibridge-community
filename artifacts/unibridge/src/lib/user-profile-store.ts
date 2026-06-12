export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  role: "Super Admin" | "Moderator" | "Mentor" | "Verified User" | "Regular User";
  reputation: number;
  country: string;
  institution: string;
  degreeLevel: string;
  fieldOfStudy: string;
  bio: string;
  interests: string[];
  skills: string[];
  goals: string;
  joinedHubs: string[];
  savedPosts: string[];
  updatedAt: string;
};

const PROFILE_KEY = "collegediscourse-user-profile-v1";
const AUTH_KEY = "collegediscourse-auth-user";

export const defaultProfile: UserProfile = {
  id: "demo-student",
  displayName: "Demo Student",
  email: "demo@collegediscourse.app",
  role: "Verified User",
  reputation: 240,
  country: "Nigeria",
  institution: "CollegeDiscourse Community",
  degreeLevel: "Graduate Applicant",
  fieldOfStudy: "Education and Research",
  bio: "Exploring scholarships, research support, and study-abroad opportunities on CollegeDiscourse.",
  interests: ["Scholarships", "Research Help", "Study Abroad"],
  skills: ["Writing", "Research", "Applications"],
  goals: "Build a stronger academic profile and help other students find reliable opportunities.",
  joinedHubs: ["scholarships", "research-help"],
  savedPosts: [],
  updatedAt: new Date().toISOString(),
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toCommaList(items: string[] | undefined): string {
  return (items ?? []).join(", ");
}

export function parseProfileLists(profile: UserProfile, interests: string, skills: string): UserProfile {
  return {
    ...profile,
    interests: splitList(interests),
    skills: splitList(skills),
    updatedAt: new Date().toISOString(),
  };
}

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile;

  const profileRaw = window.localStorage.getItem(PROFILE_KEY);
  if (profileRaw) {
    try {
      return { ...defaultProfile, ...(JSON.parse(profileRaw) as Partial<UserProfile>) };
    } catch {
      return defaultProfile;
    }
  }

  const authRaw = window.localStorage.getItem(AUTH_KEY);
  if (authRaw) {
    try {
      const authUser = JSON.parse(authRaw) as Partial<UserProfile> & { name?: string };
      return {
        ...defaultProfile,
        id: authUser.id ?? defaultProfile.id,
        displayName: authUser.displayName ?? authUser.name ?? defaultProfile.displayName,
        email: authUser.email ?? defaultProfile.email,
      };
    } catch {
      return defaultProfile;
    }
  }

  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("collegediscourse-profile-updated"));
}

export function profileStorageMode() {
  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  return hasSupabase ? "Supabase-ready mode" : "Local profile mode";
}
