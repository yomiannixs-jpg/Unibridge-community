import { useEffect, useMemo, useState } from "react";
import { Award, BadgeCheck, Flame, ShieldCheck, Star, TrendingUp } from "lucide-react";
import {
  addReputationEvent,
  getBadges,
  getReputationLevel,
  getReputationScore,
  loadReputationEvents,
  type ReputationEvent,
} from "@/lib/reputation";

function formatDate(input: string) {
  return new Date(input).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReputationPage() {
  const [events, setEvents] = useState<ReputationEvent[]>(() => loadReputationEvents());

  useEffect(() => {
    const sync = () => setEvents(loadReputationEvents());
    window.addEventListener("collegediscourse-reputation-updated", sync);
    return () => window.removeEventListener("collegediscourse-reputation-updated", sync);
  }, []);

  const score = useMemo(() => getReputationScore(events), [events]);
  const level = useMemo(() => getReputationLevel(score), [score]);
  const badges = useMemo(() => getBadges(events), [events]);
  const unlockedBadges = badges.filter((badge) => badge.unlocked);

  const addDemoPoints = () => {
    const next = addReputationEvent("comment_created", "Added a helpful answer to a student question", 15);
    setEvents(next);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">CollegeDiscourse reputation</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black">Reputation & Badges</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Track helpful participation, trusted answers, moderation support, and community contribution.
            </p>
          </div>
          <button
            onClick={addDemoPoints}
            className="rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
          >
            Add demo reputation
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Star className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Reputation</p>
          <h2 className="text-3xl font-black">{score}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <TrendingUp className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Level</p>
          <h2 className="text-xl font-black">{level}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Award className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Badges</p>
          <h2 className="text-3xl font-black">{unlockedBadges.length}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <ShieldCheck className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Trust status</p>
          <h2 className="text-xl font-black">{score >= 500 ? "Trusted" : "Building"}</h2>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-6 w-6 text-blue-700" />
          <h2 className="text-xl font-black">Badges</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl border p-4 ${badge.unlocked ? "bg-blue-50 border-blue-200" : "bg-slate-50 opacity-70"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <b>{badge.name}</b>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.unlocked ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-blue-700" />
          <h2 className="text-xl font-black">Recent reputation activity</h2>
        </div>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div>
                <b>{event.label}</b>
                <p className="text-sm text-slate-500">{formatDate(event.createdAt)}</p>
              </div>
              <span className="rounded-full bg-blue-700 px-3 py-1 text-sm font-black text-white">+{event.points}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
