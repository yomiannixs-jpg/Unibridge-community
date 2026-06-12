export type FollowUser = {
  id: string;
  name: string;
  username: string;
  role: string;
  reputation: number;
  followers: number;
  following: number;
  avatar?: string;
  bio: string;
};

export type FollowActivity = {
  id: string;
  type: "follow" | "unfollow" | "new-follower";
  actor: string;
  target: string;
  createdAt: string;
};

export type FollowStore = {
  currentUser: string;
  users: FollowUser[];
  following: string[];
  followers: string[];
  activity: FollowActivity[];
};

const FOLLOW_STORAGE_KEY = "collegediscourse-follow-store-v1";

const seedUsers: FollowUser[] = [
  {
    id: "researchnerd",
    username: "researchnerd",
    name: "ResearchNerd",
    role: "Research Mentor",
    reputation: 1840,
    followers: 320,
    following: 58,
    bio: "Helps students frame research questions, methods, and literature reviews.",
  },
  {
    id: "gradcoach",
    username: "gradcoach",
    name: "GradCoach",
    role: "PhD Admissions Advisor",
    reputation: 2210,
    followers: 510,
    following: 74,
    bio: "Supports applicants with SOPs, supervisor outreach, and funding strategy.",
  },
  {
    id: "careerbridge",
    username: "careerbridge",
    name: "CareerBridge",
    role: "Career Mentor",
    reputation: 1360,
    followers: 240,
    following: 36,
    bio: "Shares internship, CV, interview, and early-career guidance.",
  },
  {
    id: "methodmentor",
    username: "methodmentor",
    name: "MethodMentor",
    role: "Methods Contributor",
    reputation: 1650,
    followers: 285,
    following: 42,
    bio: "Answers questions on research design, data, and analysis.",
  },
  {
    id: "visaguide",
    username: "visaguide",
    name: "VisaGuide",
    role: "International Student Helper",
    reputation: 1120,
    followers: 190,
    following: 29,
    bio: "Helps students compare visa pathways, budgets, and country choices.",
  },
];

const initialStore: FollowStore = {
  currentUser: "you",
  users: seedUsers,
  following: ["researchnerd", "gradcoach"],
  followers: ["careerbridge", "methodmentor", "visaguide"],
  activity: [
    {
      id: "fa1",
      type: "follow",
      actor: "you",
      target: "ResearchNerd",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: "fa2",
      type: "new-follower",
      actor: "CareerBridge",
      target: "you",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ],
};

export function loadFollowStore(): FollowStore {
  if (typeof window === "undefined") return initialStore;

  const raw = window.localStorage.getItem(FOLLOW_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(initialStore));
    return initialStore;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FollowStore>;
    return {
      currentUser: parsed.currentUser ?? initialStore.currentUser,
      users: parsed.users?.length ? parsed.users : initialStore.users,
      following: parsed.following ?? initialStore.following,
      followers: parsed.followers ?? initialStore.followers,
      activity: parsed.activity ?? initialStore.activity,
    };
  } catch {
    return initialStore;
  }
}

export function saveFollowStore(store: FollowStore) {
  window.localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("collegediscourse-follow-updated"));
}

export function isFollowing(store: FollowStore, userId: string) {
  return store.following.includes(userId);
}

export function toggleFollow(store: FollowStore, userId: string): FollowStore {
  const alreadyFollowing = isFollowing(store, userId);
  const user = store.users.find((u) => u.id === userId);
  const userName = user?.name ?? userId;

  const nextUsers = store.users.map((u) =>
    u.id === userId
      ? { ...u, followers: Math.max(0, u.followers + (alreadyFollowing ? -1 : 1)) }
      : u
  );

  const nextFollowing = alreadyFollowing
    ? store.following.filter((id) => id !== userId)
    : [...store.following, userId];

  const activity = [
    {
      id: `fa-${Date.now()}`,
      type: alreadyFollowing ? "unfollow" as const : "follow" as const,
      actor: "you",
      target: userName,
      createdAt: new Date().toISOString(),
    },
    ...store.activity,
  ];

  return {
    ...store,
    users: nextUsers,
    following: nextFollowing,
    activity,
  };
}

export function timeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
