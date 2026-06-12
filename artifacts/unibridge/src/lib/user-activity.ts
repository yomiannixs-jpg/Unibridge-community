export type ActivityType = "post" | "comment" | "reply" | "save" | "join" | "reputation" | "moderation";

export type UserActivity = {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  href?: string;
  points?: number;
  createdAt: string;
};

const ACTIVITY_KEY = "collegediscourse-user-activity-v1";

const seedActivities: UserActivity[] = [
  {
    id: "act-1",
    type: "join",
    title: "Joined d/scholarships",
    detail: "You joined the Scholarships SubDiscourse.",
    href: "/d/scholarships",
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: "act-2",
    type: "comment",
    title: "Commented on a research methods thread",
    detail: "You added a helpful comment about choosing a research question.",
    href: "/d/research-help",
    points: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "act-3",
    type: "save",
    title: "Saved a scholarship post",
    detail: "You saved a fully funded scholarship thread for later.",
    href: "/saved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: "act-4",
    type: "reputation",
    title: "Reputation increased",
    detail: "You earned points for useful community participation.",
    href: "/reputation",
    points: 20,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
  },
];

export function loadUserActivity(): UserActivity[] {
  if (typeof window === "undefined") return seedActivities;
  const raw = window.localStorage.getItem(ACTIVITY_KEY);
  if (!raw) {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(seedActivities));
    return seedActivities;
  }
  try {
    const parsed = JSON.parse(raw) as UserActivity[];
    return Array.isArray(parsed) ? parsed : seedActivities;
  } catch {
    return seedActivities;
  }
}

export function saveUserActivity(items: UserActivity[]) {
  window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("collegediscourse-activity-updated"));
}

export function addUserActivity(activity: Omit<UserActivity, "id" | "createdAt">) {
  const next: UserActivity = {
    ...activity,
    id: `act-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const items = [next, ...loadUserActivity()].slice(0, 100);
  saveUserActivity(items);
  return next;
}

export function clearUserActivity() {
  saveUserActivity([]);
}

export function activityLabel(type: ActivityType) {
  switch (type) {
    case "post": return "Post";
    case "comment": return "Comment";
    case "reply": return "Reply";
    case "save": return "Saved";
    case "join": return "Joined";
    case "reputation": return "Reputation";
    case "moderation": return "Moderation";
    default: return "Activity";
  }
}

export function relativeTime(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
