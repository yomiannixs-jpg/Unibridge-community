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
  { id: "a1", type: "follow", label: "Started following", detail: "FinanceGuru", createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: "a2", type: "follower", label: "New follower", detail: "ResearchNerd started following you", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
];

const defaultStore: SocialStore = {
  followers: defaultFollowers,
  following: defaultFollowing,
  activities: defaultActivities,
  postsCount: 18,
  commentsCount: 92,
};

function normalize(store: SocialStore): SocialStore {
  const followingIds = new Set(store.following.map((p) => p.id));
  return {
    ...store,
    followers: store.followers.map((p) => ({ ...p, followed: followingIds.has(p.id) || !!p.followed })),
    following: store.following.map((p) => ({ ...p, followed: true })),
  };
}

export function loadSocialStore(): SocialStore {
  if (typeof window === "undefined") return defaultStore;
  const raw = window.localStorage.getItem(SOCIAL_KEY);
  if (!raw) {
    const initial = normalize(defaultStore);
    window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SocialStore>;
    return normalize({
      followers: parsed.followers?.length ? parsed.followers : defaultFollowers,
      following: parsed.following?.length ? parsed.following : defaultFollowing,
      activities: parsed.activities?.length ? parsed.activities : defaultActivities,
      postsCount: typeof parsed.postsCount === "number" ? parsed.postsCount : defaultStore.postsCount,
      commentsCount: typeof parsed.commentsCount === "number" ? parsed.commentsCount : defaultStore.commentsCount,
    });
  } catch {
    return defaultStore;
  }
}

export function saveSocialStore(store: SocialStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOCIAL_KEY, JSON.stringify(normalize(store)));
  window.dispatchEvent(new Event("collegediscourse-social-updated"));
}

export function isFollowing(personId: string) {
  return loadSocialStore().following.some((p) => p.id === personId);
}

export function toggleFollowPerson(person: SocialPerson) {
  const store = loadSocialStore();
  const alreadyFollowing = store.following.some((p) => p.id === person.id);

  const nextFollowing = alreadyFollowing
    ? store.following.filter((p) => p.id !== person.id)
    : [{ ...person, followed: true }, ...store.following];

  const next: SocialStore = normalize({
    ...store,
    followers: store.followers.map((p) => p.id === person.id ? { ...p, followed: !alreadyFollowing } : p),
    following: nextFollowing,
    activities: [
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        type: "follow",
        label: alreadyFollowing ? "Unfollowed" : "Started following",
        detail: person.name,
        createdAt: new Date().toISOString(),
      },
      ...store.activities,
    ],
  });

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
