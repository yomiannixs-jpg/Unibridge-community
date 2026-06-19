export type VoteValue = -1 | 0 | 1;

export type VoteRecord = {
  itemId: string;
  baseScore: number;
  vote: VoteValue;
};

const VOTE_KEY = "collegediscourse-votes-v1";

const defaultVotes: VoteRecord[] = [
  { itemId: "post-research-question", baseScore: 127, vote: 0 },
  { itemId: "post-scholarship-warning", baseScore: 86, vote: 0 },
  { itemId: "post-phd-email", baseScore: 54, vote: 0 },
  { itemId: "post-study-abroad-budget", baseScore: 42, vote: 0 },
  { itemId: "post-programming-ai", baseScore: 39, vote: 0 },
];

function loadVotes(): VoteRecord[] {
  if (typeof window === "undefined") return defaultVotes;
  const raw = window.localStorage.getItem(VOTE_KEY);
  if (!raw) {
    window.localStorage.setItem(VOTE_KEY, JSON.stringify(defaultVotes));
    return defaultVotes;
  }
  try {
    const parsed = JSON.parse(raw) as VoteRecord[];
    return Array.isArray(parsed) ? parsed : defaultVotes;
  } catch {
    return defaultVotes;
  }
}

function saveVotes(records: VoteRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOTE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("collegediscourse-votes-updated"));
}

export function getVoteRecord(itemId: string, fallbackScore = 0): VoteRecord {
  const records = loadVotes();
  const existing = records.find((record) => record.itemId === itemId);
  if (existing) return existing;

  const nextRecord: VoteRecord = { itemId, baseScore: fallbackScore, vote: 0 };
  saveVotes([...records, nextRecord]);
  return nextRecord;
}

export function setVote(itemId: string, fallbackScore: number, nextVote: VoteValue) {
  const records = loadVotes();
  const existing = records.find((record) => record.itemId === itemId);
  const currentVote = existing?.vote ?? 0;
  const finalVote: VoteValue = currentVote === nextVote ? 0 : nextVote;

  const nextRecords = existing
    ? records.map((record) => record.itemId === itemId ? { ...record, vote: finalVote } : record)
    : [...records, { itemId, baseScore: fallbackScore, vote: finalVote }];

  saveVotes(nextRecords);
  return getVoteRecord(itemId, fallbackScore);
}

export function resetVotes() {
  saveVotes(defaultVotes);
  return defaultVotes;
}
