export type ReputationStore = {
  score: number;
  level: string;
  badges: string[];
  activity: {
    id: string;
    label: string;
    points: number;
    createdAt: string;
  }[];
};

const REPUTATION_KEY = "collegediscourse-reputation-v1";

const defaultReputation: ReputationStore = {
  score: 240,
  level: "Verified User",
  badges: ["Helpful Member", "Research Contributor"],
  activity: [
    {
      id: "rep-1",
      label: "Helpful comment in d/research-help",
      points: 10,
      createdAt: new Date().toISOString(),
    },
  ],
};

export function loadReputationStore(): ReputationStore {
  if (typeof window === "undefined") return defaultReputation;

  const raw = window.localStorage.getItem(REPUTATION_KEY);
  if (!raw) {
    window.localStorage.setItem(REPUTATION_KEY, JSON.stringify(defaultReputation));
    return defaultReputation;
  }

  try {
    return JSON.parse(raw) as ReputationStore;
  } catch {
    return defaultReputation;
  }
}

export function saveReputationStore(store: ReputationStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPUTATION_KEY, JSON.stringify(store));
}