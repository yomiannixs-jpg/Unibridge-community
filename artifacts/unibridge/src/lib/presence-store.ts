export type PresenceStatus = "online" | "away" | "offline";

export type PresenceUser = {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
  status: PresenceStatus;
  lastSeen: string;
  currentRoom?: string;
  typing?: boolean;
};

const PRESENCE_KEY = "collegediscourse-presence-v1";

const now = Date.now();

const seedPresence: PresenceUser[] = [
  {
    id: "u1",
    name: "ResearchGuru",
    handle: "@researchguru",
    role: "Research Mentor",
    avatar: "R",
    status: "online",
    lastSeen: new Date(now - 1000 * 60 * 2).toISOString(),
    currentRoom: "Research Help",
    typing: true,
  },
  {
    id: "u2",
    name: "StatMaster",
    handle: "@statmaster",
    role: "Methods Contributor",
    avatar: "S",
    status: "online",
    lastSeen: new Date(now - 1000 * 60 * 4).toISOString(),
    currentRoom: "Research Help",
  },
  {
    id: "u3",
    name: "GradCoach",
    handle: "@gradcoach",
    role: "PhD Advisor",
    avatar: "G",
    status: "away",
    lastSeen: new Date(now - 1000 * 60 * 22).toISOString(),
    currentRoom: "PhD Admissions",
  },
  {
    id: "u4",
    name: "VisaGuide",
    handle: "@visaguide",
    role: "Study Abroad Mentor",
    avatar: "V",
    status: "online",
    lastSeen: new Date(now - 1000 * 60 * 7).toISOString(),
    currentRoom: "Study Abroad",
  },
  {
    id: "u5",
    name: "CareerBridge",
    handle: "@careerbridge",
    role: "Career Mentor",
    avatar: "C",
    status: "offline",
    lastSeen: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export function loadPresenceUsers(): PresenceUser[] {
  if (typeof window === "undefined") return seedPresence;

  const raw = window.localStorage.getItem(PRESENCE_KEY);
  if (!raw) {
    window.localStorage.setItem(PRESENCE_KEY, JSON.stringify(seedPresence));
    return seedPresence;
  }

  try {
    const parsed = JSON.parse(raw) as PresenceUser[];
    return Array.isArray(parsed) ? parsed : seedPresence;
  } catch {
    return seedPresence;
  }
}

export function savePresenceUsers(users: PresenceUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRESENCE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("collegediscourse-presence-updated"));
}

export function updateCurrentUserPresence(status: PresenceStatus) {
  const users = loadPresenceUsers();
  const current: PresenceUser = {
    id: "current-user",
    name: "Demo Student",
    handle: "@demostudent",
    role: "Verified User",
    avatar: "D",
    status,
    lastSeen: new Date().toISOString(),
    currentRoom: status === "offline" ? undefined : "CollegeDiscourse",
  };

  const exists = users.some((user) => user.id === current.id);
  const next = exists ? users.map((user) => (user.id === current.id ? current : user)) : [current, ...users];

  savePresenceUsers(next);
  return next;
}

export function presenceLabel(status: PresenceStatus) {
  if (status === "online") return "Online";
  if (status === "away") return "Away";
  return "Offline";
}

export function presenceDotClass(status: PresenceStatus) {
  if (status === "online") return "bg-emerald-500";
  if (status === "away") return "bg-yellow-500";
  return "bg-slate-400";
}

export function lastSeenLabel(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
