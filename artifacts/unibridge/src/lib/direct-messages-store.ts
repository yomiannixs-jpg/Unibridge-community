export type DirectMessage = {
  id: string;
  threadId: string;
  sender: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type MessageThread = {
  id: string;
  participantName: string;
  participantHandle: string;
  participantRole: string;
  participantAvatar: string;
  lastMessageAt: string;
  unread: number;
  messages: DirectMessage[];
};

const DM_KEY = "collegediscourse-direct-messages-v1";

const seedThreads: MessageThread[] = [
  {
    id: "thread-researchnerd",
    participantName: "ResearchNerd",
    participantHandle: "@researchnerd",
    participantRole: "Research Mentor",
    participantAvatar: "R",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    unread: 1,
    messages: [
      {
        id: "dm1",
        threadId: "thread-researchnerd",
        sender: "ResearchNerd",
        body: "I saw your question about research design. Do you want me to review your problem statement?",
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        read: false,
      },
      {
        id: "dm2",
        threadId: "thread-researchnerd",
        sender: "You",
        body: "Yes, that would be very helpful. I am trying to make the question more testable.",
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        read: true,
      },
    ],
  },
  {
    id: "thread-gradcoach",
    participantName: "GradCoach",
    participantHandle: "@gradcoach",
    participantRole: "PhD Advisor",
    participantAvatar: "G",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unread: 0,
    messages: [
      {
        id: "dm3",
        threadId: "thread-gradcoach",
        sender: "GradCoach",
        body: "Your professor outreach email should be short, specific, and tied to the professor's recent work.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
      },
    ],
  },
];

export function loadDirectMessages(): MessageThread[] {
  if (typeof window === "undefined") return seedThreads;

  const raw = window.localStorage.getItem(DM_KEY);
  if (!raw) {
    window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
    return seedThreads;
  }

  try {
    const parsed = JSON.parse(raw) as MessageThread[];
    return Array.isArray(parsed) ? parsed : seedThreads;
  } catch {
    return seedThreads;
  }
}

export function saveDirectMessages(threads: MessageThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DM_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("collegediscourse-dm-updated"));
}

export function markThreadRead(threadId: string) {
  const threads = loadDirectMessages();
  const next = threads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          unread: 0,
          messages: thread.messages.map((message) => ({ ...message, read: true })),
        }
      : thread,
  );
  saveDirectMessages(next);
  return next;
}

export function sendDirectMessage(threadId: string, body: string) {
  const threads = loadDirectMessages();
  const cleanBody = body.trim();
  if (!cleanBody) return threads;

  const next = threads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          lastMessageAt: new Date().toISOString(),
          messages: [
            ...thread.messages,
            {
              id: crypto.randomUUID?.() ?? String(Date.now()),
              threadId,
              sender: "You",
              body: cleanBody,
              createdAt: new Date().toISOString(),
              read: true,
            },
          ],
        }
      : thread,
  );

  saveDirectMessages(next);
  return next;
}

export function totalUnreadMessages() {
  return loadDirectMessages().reduce((sum, thread) => sum + thread.unread, 0);
}

export function dmTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
