import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarInitials: string;
  bio: string;
  role: "Student" | "Mentor" | "Moderator" | "Admin";
  location?: string;
  joinedAt: string;
  reputation: number;
  joinedHubs: string[];
  savedPosts: string[];
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: { email: string; password: string; username: string; displayName: string }) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  toggleJoinedHub: (slug: string) => void;
  toggleSavedPost: (postId: string) => void;
};

const AUTH_USER_KEY = "collegediscourse-auth-user-v1";
const AUTH_USERS_KEY = "collegediscourse-auth-users-v1";

const demoUser: AuthUser = {
  id: "u_demo",
  email: "demo@collegediscourse.app",
  username: "demo_student",
  displayName: "Demo Student",
  avatarInitials: "DS",
  bio: "Exploring scholarships, research support, and study-abroad opportunities on CollegeDiscourse.",
  role: "Student",
  location: "Global",
  joinedAt: new Date().toISOString(),
  reputation: 128,
  joinedHubs: ["scholarships", "research-help"],
  savedPosts: ["p3"],
};

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [demoUser];
  const raw = window.localStorage.getItem(AUTH_USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify([demoUser]));
    return [demoUser];
  }
  try {
    const users = JSON.parse(raw) as AuthUser[];
    return users.length ? users : [demoUser];
  } catch {
    return [demoUser];
  }
}

function writeUsers(users: AuthUser[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CD";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(AUTH_USER_KEY);
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    async login(email: string, _password: string) {
      const users = readUsers();
      const found = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase()) || demoUser;
      setUser(found);
      return found;
    },
    async signup(input) {
      const users = readUsers();
      const newUser: AuthUser = {
        id: `u_${Date.now()}`,
        email: input.email,
        username: input.username || input.email.split("@")[0],
        displayName: input.displayName || input.username || input.email.split("@")[0],
        avatarInitials: initialsFromName(input.displayName || input.username || input.email),
        bio: "New member of CollegeDiscourse.",
        role: "Student",
        location: "",
        joinedAt: new Date().toISOString(),
        reputation: 0,
        joinedHubs: [],
        savedPosts: [],
      };
      writeUsers([newUser, ...users.filter((candidate) => candidate.email.toLowerCase() !== input.email.toLowerCase())]);
      setUser(newUser);
      return newUser;
    },
    logout() {
      setUser(null);
    },
    updateProfile(updates) {
      setUser((current) => {
        if (!current) return current;
        const next = {
          ...current,
          ...updates,
          avatarInitials: updates.displayName ? initialsFromName(updates.displayName) : current.avatarInitials,
        };
        const users = readUsers().map((candidate) => candidate.id === next.id ? next : candidate);
        writeUsers(users.some((candidate) => candidate.id === next.id) ? users : [next, ...users]);
        return next;
      });
    },
    toggleJoinedHub(slug) {
      setUser((current) => {
        if (!current) return current;
        const joinedHubs = current.joinedHubs.includes(slug)
          ? current.joinedHubs.filter((item) => item !== slug)
          : [...current.joinedHubs, slug];
        const next = { ...current, joinedHubs };
        writeUsers(readUsers().map((candidate) => candidate.id === next.id ? next : candidate));
        return next;
      });
    },
    toggleSavedPost(postId) {
      setUser((current) => {
        if (!current) return current;
        const savedPosts = current.savedPosts.includes(postId)
          ? current.savedPosts.filter((item) => item !== postId)
          : [...current.savedPosts, postId];
        const next = { ...current, savedPosts };
        writeUsers(readUsers().map((candidate) => candidate.id === next.id ? next : candidate));
        return next;
      });
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
