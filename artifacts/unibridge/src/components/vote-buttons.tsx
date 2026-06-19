import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getVoteRecord, setVote, type VoteValue } from "@/lib/vote-store";

export function VoteButtons({
  itemId,
  baseScore,
  compact = false,
}: {
  itemId: string;
  baseScore: number;
  compact?: boolean;
}) {
  const [vote, setVoteState] = useState(() => getVoteRecord(itemId, baseScore));

  useEffect(() => {
    const sync = () => setVoteState(getVoteRecord(itemId, baseScore));
    window.addEventListener("collegediscourse-votes-updated", sync);
    return () => window.removeEventListener("collegediscourse-votes-updated", sync);
  }, [itemId, baseScore]);

  const applyVote = (value: VoteValue) => {
    setVoteState(setVote(itemId, baseScore, value));
  };

  const score = vote.baseScore + vote.vote;

  if (compact) {
    return (
      <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
        <button
          type="button"
          onClick={() => applyVote(1)}
          className={`rounded-full p-1 transition ${
            vote.vote === 1 ? "bg-blue-800 text-white" : "text-slate-500 hover:bg-white hover:text-blue-800"
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>

        <span className="min-w-[1.75rem] text-center text-xs font-black text-slate-800">{score}</span>

        <button
          type="button"
          onClick={() => applyVote(-1)}
          className={`rounded-full p-1 transition ${
            vote.vote === -1 ? "bg-blue-800 text-white" : "text-slate-500 hover:bg-white hover:text-blue-800"
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-12 shrink-0 flex-col items-center rounded-2xl bg-slate-100 py-2">
      <button
        type="button"
        onClick={() => applyVote(1)}
        className={`rounded-xl p-1 transition ${
          vote.vote === 1 ? "bg-blue-800 text-white" : "text-slate-500 hover:bg-white hover:text-blue-800"
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <span className="py-1 text-sm font-black text-slate-900">{score}</span>

      <button
        type="button"
        onClick={() => applyVote(-1)}
        className={`rounded-xl p-1 transition ${
          vote.vote === -1 ? "bg-blue-800 text-white" : "text-slate-500 hover:bg-white hover:text-blue-800"
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
