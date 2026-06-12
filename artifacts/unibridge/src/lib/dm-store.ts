export type DirectMessage = {
  id: string;
  threadId: string;
  sender: "me" | "them";
  body: string;
  createdAt: string;
};

export type DMThread = {
  id: string;
  personName: string;
  handle: string;
  role: string;
  avatar: string;
  unread: number;
  messages: DirectMessage[];
};

const DM_KEY = "collegediscourse-direct-messages-v1";

const seedThreads: DMThread[] = [
  {
    id: "dm-1",
    personName: "ResearchNerd",
    handle: "@researchnerd",
    role: "Research Mentor",
    avatar: "R",
    unread: 1,
    messages: [
      {
        id: "m1",
        threadId: "dm-1",
        sender: "them",
        body: "Hi Demo Student, I saw your question on research design. Happy to help you refine it.",
        createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      },
      {
        id: "m2",
        threadId: "dm-1",
        sender: "me",
        body: "Thank you. I am trying to make the question more focused and testable.",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "m3",
        threadId: "dm-1",
        sender: "them",
        body: "Good. Start by defining population, outcome, mechanism, and why the answer matters.",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
  },
  {
    id: "dm-2",
    personName: "CareerBridge",
    handle: "@careerbridge",
    role: "Career Mentor",
    avatar: "C",
    unread: 0,
    messages: [
      {
        id: "m4",
        threadId: "dm-2",
        sender: "them",
        body: "Send your CV draft whenever you are ready. I can review the structure.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
      },
    ],
  },
  {
    id: "dm-3",
    personName: "VisaGuide",
    handle: "@visaguide",
    role: "Study Abroad Helper",
    avatar: "V",
    unread: 2,
    messages: [
      {
        id: "m5",
        threadId: "dm-3",
        sender: "them",
        body: "For study abroad planning, compare tuition, work rights, funding, and post-study visa.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: "m6",
        threadId: "dm-3",
        sender: "them",
        body: "Germany may be cheaper, but Canada may have a clearer work pathway depending on your field.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
];

export function loadDMThreads(): DMThread[] {
  if (typeof window === "undefined") return seedThreads;
  const raw = window.localStorage.getItem(DM_KEY);

  if (!raw) {
    window.localStorage.setItem(DM_KEY, JSON.stringify(seedThreads));
    return seedThreads;
  }

  try {
    const parsed = JSON.parse(raw) as DMThread[];
    return Array.isArray(parsed) ? parsed : seedThreads;
  } catch {
    return seedThreads;
  }
}

export function saveDMThreads(threads: DMThread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DM_KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("collegediscourse-dm-updated"));
}

export function sendDM(threadId: string, body: string) {
  const text = body.trim();
  if (!text) return loadDMThreads();

  const threads = loadDMThreads();
  const next = threads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          unread: 0,
          messages: [
            ...thread.messages,
            {
              id: crypto.randomUUID?.() ?? String(Date.now()),
              threadId,
              sender: "me" as const,
              body: text,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      : thread,
  );

  saveDMThreads(next);
  return next;
}

export function markThreadRead(threadId: string) {
  const next = loadDMThreads().map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread));
  saveDMThreads(next);
  return next;
}

export function dmTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
