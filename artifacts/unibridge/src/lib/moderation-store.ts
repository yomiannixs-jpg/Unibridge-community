export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReportPriority = "low" | "medium" | "high";

export type ModerationReport = {
  id: string;
  targetType: "post" | "comment" | "user" | "hub";
  targetTitle: string;
  hubSlug: string;
  reason: string;
  details: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
};

export type Moderator = {
  id: string;
  name: string;
  role: "Super Admin" | "Moderator" | "Mentor Moderator";
  hubSlug: string;
  active: boolean;
};

export type SafetySettings = {
  blockedWords: string[];
  antiAgentMode: boolean;
  requireCountryDeadline: boolean;
  autoFlagRepeatedPosts: boolean;
  postingLimitPerHour: number;
};

export type ModerationStore = {
  reports: ModerationReport[];
  moderators: Moderator[];
  safety: SafetySettings;
};

const MODERATION_KEY = "collegediscourse-moderation-v1";

const seedStore: ModerationStore = {
  reports: [
    {
      id: "r1",
      targetType: "post",
      targetTitle: "Guaranteed scholarship if you pay processing fee",
      hubSlug: "scholarships",
      reason: "Potential scam scholarship",
      details: "The post asks students to pay before seeing the application link.",
      status: "open",
      priority: "high",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "r2",
      targetType: "comment",
      targetTitle: "Agent contact posted repeatedly",
      hubSlug: "study-abroad",
      reason: "Repeated agent spam",
      details: "Same phone number appears across multiple comments.",
      status: "reviewing",
      priority: "medium",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: "r3",
      targetType: "post",
      targetTitle: "Missing deadline and country information",
      hubSlug: "scholarships",
      reason: "Incomplete scholarship post",
      details: "Scholarship post has no country, level, eligibility, or deadline.",
      status: "open",
      priority: "low",
      createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    },
  ],
  moderators: [
    { id: "m1", name: "Demo Student", role: "Super Admin", hubSlug: "all", active: true },
    { id: "m2", name: "Scholarship Mentor", role: "Moderator", hubSlug: "scholarships", active: true },
    { id: "m3", name: "Research Mentor", role: "Mentor Moderator", hubSlug: "research-help", active: true },
  ],
  safety: {
    blockedWords: ["pay first", "guaranteed visa", "agent fee"],
    antiAgentMode: true,
    requireCountryDeadline: true,
    autoFlagRepeatedPosts: true,
    postingLimitPerHour: 6,
  },
};

export function loadModerationStore(): ModerationStore {
  if (typeof window === "undefined") return seedStore;
  const raw = window.localStorage.getItem(MODERATION_KEY);
  if (!raw) {
    window.localStorage.setItem(MODERATION_KEY, JSON.stringify(seedStore));
    return seedStore;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ModerationStore>;
    return {
      reports: parsed.reports ?? seedStore.reports,
      moderators: parsed.moderators ?? seedStore.moderators,
      safety: { ...seedStore.safety, ...(parsed.safety ?? {}) },
    };
  } catch {
    return seedStore;
  }
}

export function saveModerationStore(store: ModerationStore) {
  window.localStorage.setItem(MODERATION_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("collegediscourse-moderation-updated"));
}

export function updateReportStatus(id: string, status: ReportStatus) {
  const store = loadModerationStore();
  const next = {
    ...store,
    reports: store.reports.map((report) => (report.id === id ? { ...report, status } : report)),
  };
  saveModerationStore(next);
  return next;
}

export function addReport(input: Omit<ModerationReport, "id" | "createdAt" | "status">) {
  const store = loadModerationStore();
  const report: ModerationReport = {
    ...input,
    id: `r-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "open",
  };
  const next = { ...store, reports: [report, ...store.reports] };
  saveModerationStore(next);
  return next;
}

export function clearResolvedReports() {
  const store = loadModerationStore();
  const next = {
    ...store,
    reports: store.reports.filter((report) => report.status !== "resolved" && report.status !== "dismissed"),
  };
  saveModerationStore(next);
  return next;
}

export function addModerator(name: string, hubSlug: string, role: Moderator["role"] = "Moderator") {
  const store = loadModerationStore();
  const moderator: Moderator = {
    id: `m-${Date.now()}`,
    name,
    hubSlug,
    role,
    active: true,
  };
  const next = { ...store, moderators: [moderator, ...store.moderators] };
  saveModerationStore(next);
  return next;
}

export function toggleModerator(id: string) {
  const store = loadModerationStore();
  const next = {
    ...store,
    moderators: store.moderators.map((moderator) =>
      moderator.id === id ? { ...moderator, active: !moderator.active } : moderator,
    ),
  };
  saveModerationStore(next);
  return next;
}

export function saveSafetySettings(safety: SafetySettings) {
  const store = loadModerationStore();
  const next = { ...store, safety };
  saveModerationStore(next);
  return next;
}
