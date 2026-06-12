export type Mention = {
  id: string;
  username: string;
  sourceType: "post" | "comment" | "reply";
  sourceTitle: string;
  sourceUrl: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const MENTIONS_KEY = "collegediscourse-mentions-v1";

const seedMentions: Mention[] = [
  {
    id: "m1",
    username: "DemoStudent",
    sourceType: "comment",
    sourceTitle: "What makes a research question strong enough for a serious paper?",
    sourceUrl: "/posts/p3",
    body: "@DemoStudent this thread may help with your research design question.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
  },
  {
    id: "m2",
    username: "DemoStudent",
    sourceType: "post",
    sourceTitle: "Scholarship application checklist",
    sourceUrl: "/d/scholarships",
    body: "Tagging @DemoStudent because this scholarship has a research funding component.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
  },
];

export function extractMentions(text: string): string[] {
  const matches = text.match(/@([A-Za-z0-9_][A-Za-z0-9_.-]{1,30})/g) ?? [];
  return Array.from(new Set(matches.map((m) => m.replace("@", ""))));
}

export function loadMentions(): Mention[] {
  if (typeof window === "undefined") return seedMentions;
  const raw = window.localStorage.getItem(MENTIONS_KEY);
  if (!raw) {
    window.localStorage.setItem(MENTIONS_KEY, JSON.stringify(seedMentions));
    return seedMentions;
  }
  try {
    const parsed = JSON.parse(raw) as Mention[];
    return Array.isArray(parsed) ? parsed : seedMentions;
  } catch {
    return seedMentions;
  }
}

export function saveMentions(mentions: Mention[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MENTIONS_KEY, JSON.stringify(mentions));
  window.dispatchEvent(new Event("collegediscourse-mentions-updated"));
}

export function addMention(input: Omit<Mention, "id" | "createdAt" | "read">) {
  const mentions = loadMentions();
  const next: Mention[] = [
    {
      ...input,
      id: crypto.randomUUID?.() ?? String(Date.now()),
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...mentions,
  ];
  saveMentions(next);
  return next;
}

export function markMentionRead(id: string) {
  const next = loadMentions().map((mention) => (mention.id === id ? { ...mention, read: true } : mention));
  saveMentions(next);
  return next;
}

export function markAllMentionsRead() {
  const next = loadMentions().map((mention) => ({ ...mention, read: true }));
  saveMentions(next);
  return next;
}

export function clearReadMentions() {
  const next = loadMentions().filter((mention) => !mention.read);
  saveMentions(next);
  return next;
}

export function mentionTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
