export type MentionNotification = {
  id: string;
  from: string;
  postTitle: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const MENTION_KEY = "collegediscourse-mentions-v1";

const defaultMentions: MentionNotification[] = [
  {
    id: "mention-1",
    from: "MethodMentor",
    postTitle: "How do I make my research question more testable?",
    body: "@You start from the research idea, but quickly check whether the data can actually measure it.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
  },
  {
    id: "mention-2",
    from: "GradCoach",
    postTitle: "What should I write in a first email to a potential PhD supervisor?",
    body: "@You keep the email short and specific. Mention one paper and one clear research fit.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
];

function safeMentions() {
  if (typeof window === "undefined") return defaultMentions;
  const raw = window.localStorage.getItem(MENTION_KEY);
  if (!raw) {
    window.localStorage.setItem(MENTION_KEY, JSON.stringify(defaultMentions));
    return defaultMentions;
  }
  try {
    const parsed = JSON.parse(raw) as MentionNotification[];
    return Array.isArray(parsed) ? parsed : defaultMentions;
  } catch {
    return defaultMentions;
  }
}

export function loadMentions() {
  return safeMentions();
}

export function saveMentions(mentions: MentionNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MENTION_KEY, JSON.stringify(mentions));
  window.dispatchEvent(new Event("collegediscourse-mentions-updated"));
}

export function addMention(from: string, postTitle: string, body: string) {
  const next: MentionNotification[] = [
    { id: crypto.randomUUID?.() ?? String(Date.now()), from, postTitle, body, createdAt: new Date().toISOString(), read: false },
    ...safeMentions(),
  ];
  saveMentions(next);
  return next;
}

export function markMentionRead(id: string) {
  const next = safeMentions().map((mention) => (mention.id === id ? { ...mention, read: true } : mention));
  saveMentions(next);
  return next;
}

export function markAllMentionsRead() {
  const next = safeMentions().map((mention) => ({ ...mention, read: true }));
  saveMentions(next);
  return next;
}

export function mentionTimeAgo(input: string) {
  const date = new Date(input);
  if (!input || Number.isNaN(date.getTime())) return "recently";
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
