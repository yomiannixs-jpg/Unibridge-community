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

const now = Date.now();

const seedThreads: MessageThread[] = [
  {
    id: "thread-researchnerd",
    participantName: "ResearchNerd",
    participantHandle: "@researchnerd",
    participantRole: "Research Mentor",
    participantAvatar: "R",
    lastMessageAt: new Date(now - 1000 * 60 * 25).toISOString(),
    unread: 1,
    messages: [
      {
        id: "dm1",
        threadId: "thread-researchnerd",
        sender: "ResearchNerd",
        body: "Hi Demo Student, I saw your question on research design. Happy to help you refine it.",
        createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
        read: false,
      },
      {
        id: "dm2",
        threadId: "thread-researchnerd",
        sender: "You",
        body: "Thank you. I am trying to make the question more focused and testable.",
        createdAt: new Date(now - 1000 * 60 * 46).toISOString(),
        read: true,
      },
    ],
  },
  {
    id: "thread-careerbridge",
    participantName: "CareerBridge",
    participantHandle: "@careerbridge",
    participantRole: "Career Mentor",
    participantAvatar: "C",
    lastMessageAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
    unread: 0,
    messages: [
      {
        id: "dm3",
        threadId: "thread-careerbridge",
        sender: "CareerBridge",
        body: "Send your CV draft whenever you are ready. I can review the structure.",
        createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
      },
    ],
  },
  {
    id: "thread-visaguide",
    participantName: "VisaGuide",
    participantHandle: "@visaguide",
    participantRole: "Study Abroad Mentor",
    participantAvatar: "V",
    lastMessageAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
    unread: 2,
    messages: [
      {
        id: "dm4",
        threadId: "thread-visaguide",
        sender: "VisaGuide",
        body: "Germany may be cheaper, but Canada may have a clearer work pathway depending on the program.",
        createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        read: false,
      },
    ],
  },
];

function normalizeThread(thread: Partial<MessageThread>, index: number): MessageThread {
  const fallbackName = thread.participantName || thread["from" as keyof typeof thread] as string || `Contact ${index + 1}`;
  const safeName = String(fallbackName || `Contact ${index + 1}`);
  const safeDate = thread.lastMessageAt && !Number.isNaN(new Date(thread.lastMessageAt).getTime())
    ? thread.lastMessageAt
    : new Date(Date.now() - 1000 * 60 * (index + 1) * 15).toISOString();

  const messages = Array.isArray(thread.messages) ? thread.messages : [];

  return {
    id: thread.id || `thread-${safeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    participantName: safeName,
    participantHandle: thread.participantHandle || `@${safeName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    participantRole: thread.participantRole || "CollegeDiscourse Member",
    participantAvatar: thread.participantAvatar || safeName.charAt(0).toUpperCase(),
    lastMessageAt: safeDate,
    unread: typeof thread.unread === "number" ? thread.unread : 0,
    messages: messages.map((message, messageIndex) => ({
      id: message.id || `dm-${index}-${messageIndex}`,
      threadId: message.threadId || thread.id || `thread-${index}`,
      sender: message.sender || safeName,
      body: message.body || "",
      createdAt:
        message.createdAt && !Number.isNaN(new Date(message.createdAt).getTime())
          ? message.createdAt
          : safeDate,
      read: typeof message.read === "boolean" ? message.read : true,
    })),
  };
}

export function loadDirectMessages(): MessageThread[] {
  if (typeof window === "undefined") return seedThreads;

  const raw = window.localStorage.getItem(DM_KEY);
  if (!raw) {
    window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
    return seedThreads;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MessageThread>[];
    if (!Array.isArray(parsed) || !parsed.length) {
      window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
      return seedThreads;
    }
    return parsed.map(normalizeThread);
  } catch {
    window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
    return seedThreads;
  }
}

export function saveDirectMessages(threads: MessageThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DM_KEY, JSON.stringify(threads.map(normalizeThread)));
  window.dispatchEvent(new Event("collegediscourse-dm-updated"));
}

export function resetDirectMessages() {
  if (typeof window === "undefined") return seedThreads;
  window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
  window.dispatchEvent(new Event("collegediscourse-dm-updated"));
  return seedThreads;
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
  const date = new Date(input);
  if (!input || Number.isNaN(date.getTime())) return "recently";

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
