export type UserRole =
  | "Super Admin"
  | "Moderator"
  | "Mentor"
  | "Verified User"
  | "Regular User";

export type UserStatus = "Active" | "Warned" | "Muted" | "Banned";

export type ModerationUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedHubs: string[];
  reportsHandled: number;
  reputation: number;
  createdAt: string;
};

const STORAGE_KEY = "collegediscourse-moderation-users-v1";

export const roleRank: Record<UserRole, number> = {
  "Super Admin": 5,
  Moderator: 4,
  Mentor: 3,
  "Verified User": 2,
  "Regular User": 1,
};

const seedUsers: ModerationUser[] = [
  {
    id: "u1",
    name: "Demo Student",
    email: "demo@student.com",
    role: "Super Admin",
    status: "Active",
    joinedHubs: ["scholarships", "research-help"],
    reportsHandled: 18,
    reputation: 520,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "u2",
    name: "Scholarship Mentor",
    email: "mentor@collegediscourse.org",
    role: "Mentor",
    status: "Active",
    joinedHubs: ["scholarships", "study-abroad"],
    reportsHandled: 7,
    reputation: 410,
    createdAt: "2026-06-03T10:30:00.000Z",
  },
  {
    id: "u3",
    name: "Research Guide",
    email: "research@collegediscourse.org",
    role: "Moderator",
    status: "Active",
    joinedHubs: ["research-help", "phd-admissions"],
    reportsHandled: 12,
    reputation: 680,
    createdAt: "2026-06-04T15:10:00.000Z",
  },
  {
    id: "u4",
    name: "Agent Watchlist",
    email: "agent@example.com",
    role: "Regular User",
    status: "Warned",
    joinedHubs: ["study-abroad"],
    reportsHandled: 0,
    reputation: 12,
    createdAt: "2026-06-08T12:45:00.000Z",
  },
];

export function loadModerationUsers(): ModerationUser[] {
  if (typeof window === "undefined") return seedUsers;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }

  try {
    const parsed = JSON.parse(raw) as ModerationUser[];
    return Array.isArray(parsed) && parsed.length ? parsed : seedUsers;
  } catch {
    return seedUsers;
  }
}

export function saveModerationUsers(users: ModerationUser[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("collegediscourse-moderation-users-updated"));
}

export function setUserRole(userId: string, role: UserRole) {
  const users = loadModerationUsers().map((user) =>
    user.id === userId ? { ...user, role } : user,
  );
  saveModerationUsers(users);
  return users;
}

export function setUserStatus(userId: string, status: UserStatus) {
  const users = loadModerationUsers().map((user) =>
    user.id === userId ? { ...user, status } : user,
  );
  saveModerationUsers(users);
  return users;
}

export function addModerationUser(user: Omit<ModerationUser, "id" | "createdAt">) {
  const users = loadModerationUsers();
  const nextUser: ModerationUser = {
    ...user,
    id: `u-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [nextUser, ...users];
  saveModerationUsers(next);
  return next;
}
