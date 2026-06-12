export type ReputationEventType =
  | "post_created"
  | "comment_created"
  | "reply_created"
  | "post_upvoted"
  | "comment_upvoted"
  | "post_saved"
  | "report_resolved"
  | "moderation_action";

export type ReputationEvent = {
  id: string;
  type: ReputationEventType;
  label: string;
  points: number;
  createdAt: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

const REP_STORAGE_KEY = "collegediscourse-reputation-v1";

const seedEvents: ReputationEvent[] = [
  {
    id: "rep-1",
    type: "post_created",
    label: "Started a helpful scholarship discussion",
    points: 25,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "rep-2",
    type: "comment_created",
    label: "Answered a research methods question",
    points: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "rep-3",
    type: "post_upvoted",
    label: "Received upvotes from other students",
    points: 40,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "rep-4",
    type: "report_resolved",
    label: "Helped resolve a moderation report",
    points: 30,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export function loadReputationEvents(): ReputationEvent[] {
  if (typeof window === "undefined") return seedEvents;
  const raw = window.localStorage.getItem(REP_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(REP_STORAGE_KEY, JSON.stringify(seedEvents));
    return seedEvents;
  }
  try {
    const parsed = JSON.parse(raw) as ReputationEvent[];
    return Array.isArray(parsed) ? parsed : seedEvents;
  } catch {
    return seedEvents;
  }
}

export function saveReputationEvents(events: ReputationEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REP_STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("collegediscourse-reputation-updated"));
}

export function addReputationEvent(type: ReputationEventType, label: string, points: number) {
  const events = loadReputationEvents();
  const next = [
    {
      id: `rep-${Date.now()}`,
      type,
      label,
      points,
      createdAt: new Date().toISOString(),
    },
    ...events,
  ];
  saveReputationEvents(next);
  return next;
}

export function getReputationScore(events = loadReputationEvents()) {
  return events.reduce((sum, item) => sum + item.points, 0);
}

export function getReputationLevel(score: number) {
  if (score >= 2500) return "Campus Legend";
  if (score >= 1000) return "Senior Mentor";
  if (score >= 500) return "Trusted Contributor";
  if (score >= 150) return "Helpful Student";
  return "New Member";
}

export function getBadges(events = loadReputationEvents()): Badge[] {
  const score = getReputationScore(events);
  const posts = events.filter((e) => e.type === "post_created").length;
  const comments = events.filter((e) => e.type === "comment_created" || e.type === "reply_created").length;
  const moderation = events.filter((e) => e.type === "report_resolved" || e.type === "moderation_action").length;

  return [
    {
      id: "first-helper",
      name: "First Helper",
      description: "Earned your first 50 reputation points.",
      unlocked: score >= 50,
    },
    {
      id: "trusted-contributor",
      name: "Trusted Contributor",
      description: "Reached 500 reputation points.",
      unlocked: score >= 500,
    },
    {
      id: "discussion-starter",
      name: "Discussion Starter",
      description: "Created at least 3 posts.",
      unlocked: posts >= 3,
    },
    {
      id: "answer-builder",
      name: "Answer Builder",
      description: "Contributed at least 5 comments or replies.",
      unlocked: comments >= 5,
    },
    {
      id: "community-guardian",
      name: "Community Guardian",
      description: "Helped with moderation actions.",
      unlocked: moderation >= 2,
    },
  ];
}
