import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AuthRole = "Student" | "Mentor" | "Moderator" | "Admin";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarInitials: string;
  bio: string;
  role: AuthRole;
  location?: string;
  joinedAt: string;
  reputation: number;
  joinedHubs: string[];
  savedPosts: string[];
  provider?: "local" | "supabase";
  accessToken?: string;
};

type SignupInput = {
  email: string;
  password: string;
  username: string;
  displayName: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authMode: "supabase" | "local";
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (input: SignupInput) => Promise<AuthUser>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  toggleJoinedHub: (slug: string) => void;
  toggleSavedPost: (postId: string) => void;
};

const AUTH_USER_KEY = "collegediscourse-auth-user-v2";
const AUTH_USERS_KEY = "collegediscourse-auth-users-v2";
const LEGACY_USER_KEY = "collegediscourse-auth-user-v1";
const LEGACY_USERS_KEY = "collegediscourse-auth-users-v1";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

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
  provider: "local",
};

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CD"
  );
}

function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [demoUser];
  const raw = window.localStorage.getItem(AUTH_USERS_KEY) || window.localStorage.getItem(LEGACY_USERS_KEY);
  const users = safeJson<AuthUser[]>(raw, [demoUser]);
  if (!window.localStorage.getItem(AUTH_USERS_KEY)) {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users.length ? users : [demoUser]));
  }
  return users.length ? users : [demoUser];
}

function writeUsers(users: AuthUser[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  }
}

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(AUTH_USER_KEY);
}

function readSessionUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY) || window.localStorage.getItem(LEGACY_USER_KEY);
  return safeJson<AuthUser | null>(raw, null);
}

function toCollegeUserFromSupabase(payload: any, fallbackEmail: string, accessToken?: string): AuthUser {
  const supabaseUser = payload?.user ?? payload;
  const metadata = supabaseUser?.user_metadata ?? {};
  const displayName = metadata.display_name || metadata.displayName || metadata.name || fallbackEmail.split("@")[0];
  const username = metadata.username || fallbackEmail.split("@")[0];

  return {
    id: supabaseUser?.id || `sb_${Date.now()}`,
    email: supabaseUser?.email || fallbackEmail,
    username,
    displayName,
    avatarInitials: initialsFromName(displayName),
    bio: metadata.bio || "CollegeDiscourse member.",
    role: (metadata.role as AuthRole) || "Student",
    location: metadata.location || "",
    joinedAt: supabaseUser?.created_at || new Date().toISOString(),
    reputation: Number(metadata.reputation ?? 0),
    joinedHubs: Array.isArray(metadata.joinedHubs) ? metadata.joinedHubs : [],
    savedPosts: Array.isArray(metadata.savedPosts) ? metadata.savedPosts : [],
    provider: "supabase",
    accessToken,
  };
}

async function supabaseRequest(path: string, options: RequestInit = {}) {
  if (!supabaseReady) throw new Error("Supabase is not configured.");

  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey!,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error_description || data?.error || "Supabase authentication failed.");
  }
  return data;
}

async function supabaseLogin(email: string, password: string) {
  const data = await supabaseRequest("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return toCollegeUserFromSupabase(data.user, email, data.access_token);
}

async function supabaseSignup(input: SignupInput) {
  const data = await supabaseRequest("/signup", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        username: input.username,
        display_name: input.displayName,
        role: "Student",
        reputation: 0,
        joinedHubs: [],
        savedPosts: [],
      },
    }),
  });

  return toCollegeUserFromSupabase(data.user, input.email, data.access_token);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSessionUser());

  useEffect(() => {
    persistUser(user);
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    authMode: supabaseReady ? "supabase" : "local",
    async login(email: string, password: string) {
      if (supabaseReady) {
        try {
          const next = await supabaseLogin(email, password);
          setUser(next);
          return next;
        } catch (error) {
          // Keep demo/local login available as a fallback during early deployment.
          if (email !== demoUser.email) throw error;
        }
      }

      const users = readUsers();
      const found = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase()) || demoUser;
      setUser(found);
      return found;
    },
    async signup(input) {
      if (!input.email || !input.password || !input.username) {
        throw new Error("Email, username, and password are required.");
      }

      if (supabaseReady) {
        const next = await supabaseSignup(input);
        setUser(next);
        return next;
      }

      const users = readUsers();
      const displayName = input.displayName || input.username || input.email.split("@")[0];
      const newUser: AuthUser = {
        id: `u_${Date.now()}`,
        email: input.email,
        username: input.username || input.email.split("@")[0],
        displayName,
        avatarInitials: initialsFromName(displayName),
        bio: "New member of CollegeDiscourse.",
        role: "Student",
        location: "",
        joinedAt: new Date().toISOString(),
        reputation: 0,
        joinedHubs: [],
        savedPosts: [],
        provider: "local",
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
        const users = readUsers();
        const updatedUsers = users.map((candidate) => (candidate.id === next.id ? next : candidate));
        writeUsers(updatedUsers.some((candidate) => candidate.id === next.id) ? updatedUsers : [next, ...users]);
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
        const users = readUsers().map((candidate) => (candidate.id === next.id ? next : candidate));
        writeUsers(users.some((candidate) => candidate.id === next.id) ? users : [next, ...readUsers()]);
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
        const users = readUsers().map((candidate) => (candidate.id === next.id ? next : candidate));
        writeUsers(users.some((candidate) => candidate.id === next.id) ? users : [next, ...readUsers()]);
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
