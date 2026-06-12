export type SocialPerson = {
  id: string;
  name: string;
  handle: string;
  role: string;
  reputation: number;
  avatar: string;
  followed?: boolean;
};

export type SocialActivity = {
  id: string;
  type: "post" | "comment" | "reply" | "save" | "join" | "follow" | "follower" | "reputation";
  label: string;
  detail: string;
  createdAt: string;
};

export type SocialStore = {
  followers: SocialPerson[];
  following: SocialPerson[];
  activities: SocialActivity[];
  postsCount: number;
  commentsCount: number;
};

const SOCIAL_KEY = "collegediscourse-social-v1";

const defaultFollowers: SocialPerson[] = [
  { id: "u1", name: "ResearchNerd", handle: "@researchnerd", role: "Research Mentor", reputation: 1280, avatar: "R", followed: true },
  { id: "u2", name: "GradCoach", handle: "@gradcoach", role: "PhD Advisor", reputation: 2210, avatar: "G", followed: false },
  { id: "u3", name: "MethodMentor", handle: "@methodmentor", role: "Methods Mentor", reputation: 1740, avatar: "M", followed: true },
  { id: "u4", name: "LinaStudy", handle: "@linastudy", role: "Study Abroad Applicant", reputation: 540, avatar: "L", followed: false },
];

const defaultFollowing: SocialPerson[] = [
  { id: "u5", name: "FinanceGuru", handle: "@financeguru", role: "Finance Mentor", reputation: 1890, avatar: "F", followed: true },
  { id: "u6", name: "CareerBridge", handle: "@careerbridge", role: "Career Mentor", reputation: 1460, avatar: "C", followed: true },
  { id: "u7", name: "AminaStudy", handle: "@aminastudy", role: "Graduate Applicant", reputation: 720, avatar: "A", followed: true },
];

const defaultActivities: SocialActivity[] = [
  {
    id: "a1",
    type: "follow",
    label: "Started following",
    detail: "FinanceGuru",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "a2",
    type: "follower",
    label: "New follower",
    detail: "ResearchNerd started following you",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "a3",
    type: "save",
    label: "Saved post",
    detail: "Professor email structure for PhD applicants",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    id: "a4",
    type: "reputation",
    label: "Earned reputation",
    detail: "+10 for a helpful answer in d/research-help",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
  {
    id: "a5",
    type: "join",
    label: "Joined SubDiscourse",
    detail: "d/scholarships",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

const defaultStore: SocialStore = {
  followers: defaultFollowers,
  following: defaultFollowing,
  activities: defaultActivities,
  postsCount: 18,
  commentsCount: 92,
};

export function loadSocialStore(): SocialStore {
  if (typeof window === "undefined") return defaultStore;

  const raw = window.localStorage.getItem(SOCIAL_KEY);

  if (!raw) {
    window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(defaultStore));
    return defaultStore;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SocialStore>;
    return {
      followers: parsed.followers?.length ? parsed.followers : defaultFollowers,
      following: parsed.following?.length ? parsed.following : defaultFollowing,
      activities: parsed.activities?.length ? parsed.activities : defaultActivities,
      postsCount: typeof parsed.postsCount === "number" ? parsed.postsCount : defaultStore.postsCount,
      commentsCount: typeof parsed.commentsCount === "number" ? parsed.commentsCount : defaultStore.commentsCount,
    };
  } catch {
    return defaultStore;
  }
}

export function saveSocialStore(store: SocialStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("collegediscourse-social-updated"));
}

export function toggleFollowPerson(person: SocialPerson) {
  const store = loadSocialStore();
  const alreadyFollowing = store.following.some((p) => p.id === person.id);

  const next: SocialStore = alreadyFollowing
    ? {
        ...store,
        following: store.following.filter((p) => p.id !== person.id),
        activities: [
          {
            id: crypto.randomUUID?.() ?? String(Date.now()),
            type: "follow",
            label: "Unfollowed",
            detail: person.name,
            createdAt: new Date().toISOString(),
          },
          ...store.activities,
        ],
      }
    : {
        ...store,
        following: [{ ...person, followed: true }, ...store.following],
        activities: [
          {
            id: crypto.randomUUID?.() ?? String(Date.now()),
            type: "follow",
            label: "Started following",
            detail: person.name,
            createdAt: new Date().toISOString(),
          },
          ...store.activities,
        ],
      };

  saveSocialStore(next);
  return next;
}

export function timeAgoShort(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
