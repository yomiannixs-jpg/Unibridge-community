import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "super_admin" | "moderator" | "mentor" | "verified" | "user";
export type UserStatus = "active" | "muted" | "banned";

export type CollegeDiscourseUser = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  bio: string;
  role: UserRole;
  status: UserStatus;
  reputation: number;
  joinedHubs: string[];
  savedPosts: string[];
  createdAt: string;
  lastLoginAt: string;
};

type AuthContextValue = {
  user: CollegeDiscourseUser | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => CollegeDiscourseUser;
  signup: (payload: { name: string; email: string; bio?: string }) => CollegeDiscourseUser;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<CollegeDiscourseUser, "name" | "bio" | "avatarInitials">>) => void;
  joinHub: (slug: string) => void;
  leaveHub: (slug: string) => void;
  savePost: (postId: string) => void;
  unsavePost: (postId: string) => void;
};

const AUTH_KEY = "collegediscourse-current-user-v2";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : (parts[0]?.slice(0, 2) || "CD");
  return letters.toUpperCase();
}

function makeUser(email: string, name?: string, bio?: string): CollegeDiscourseUser {
  const safeName = name?.trim() || email.split("@")[0] || "CollegeDiscourse User";
  const now = new Date().toISOString();
  return {
    id: `user-${Date.now()}`,
    name: safeName,
    email,
    avatarInitials: initialsFromName(safeName),
    bio: bio || "Exploring Hubs, scholarships, research support, and study-abroad opportunities on CollegeDiscourse.",
    role: "verified",
    status: "active",
    reputation: 120,
    joinedHubs: ["scholarships", "research-help"],
    savedPosts: [],
    createdAt: now,
    lastLoginAt: now,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CollegeDiscourseUser | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const persist = (next: CollegeDiscourseUser | null) => {
    setUser(next);
    if (next) window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("collegediscourse-auth-updated"));
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    login(email, name) {
      const next = user
        ? { ...user, email, name: name || user.name, lastLoginAt: new Date().toISOString() }
        : makeUser(email, name);
      persist(next);
      return next;
    },
    signup(payload) {
      const next = makeUser(payload.email, payload.name, payload.bio);
      persist(next);
      return next;
    },
    logout() {
      persist(null);
    },
    updateProfile(patch) {
      if (!user) return;
      const next = {
        ...user,
        ...patch,
        avatarInitials: patch.avatarInitials || (patch.name ? initialsFromName(patch.name) : user.avatarInitials),
      };
      persist(next);
    },
    joinHub(slug) {
      if (!user || user.joinedHubs.includes(slug)) return;
      persist({ ...user, joinedHubs: [...user.joinedHubs, slug], reputation: user.reputation + 2 });
    },
    leaveHub(slug) {
      if (!user) return;
      persist({ ...user, joinedHubs: user.joinedHubs.filter((hub) => hub !== slug) });
    },
    savePost(postId) {
      if (!user || user.savedPosts.includes(postId)) return;
      persist({ ...user, savedPosts: [...user.savedPosts, postId], reputation: user.reputation + 1 });
    },
    unsavePost(postId) {
      if (!user) return;
      persist({ ...user, savedPosts: user.savedPosts.filter((id) => id !== postId) });
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function roleLabel(role: UserRole) {
  return {
    super_admin: "Super Admin",
    moderator: "Moderator",
    mentor: "Mentor",
    verified: "Verified User",
    user: "Regular User",
  }[role];
}
