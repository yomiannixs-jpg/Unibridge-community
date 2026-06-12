import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Activity, Bookmark, MessageCircle, PlusCircle, RefreshCw, Star, Users } from "lucide-react";
import { activityLabel, clearUserActivity, loadUserActivity, relativeTime, type ActivityType } from "@/lib/user-activity";

const filters: Array<"all" | ActivityType> = ["all", "post", "comment", "reply", "save", "join", "reputation", "moderation"];

function iconFor(type: ActivityType) {
  switch (type) {
    case "post": return PlusCircle;
    case "comment": return MessageCircle;
    case "reply": return MessageCircle;
    case "save": return Bookmark;
    case "join": return Users;
    case "reputation": return Star;
    case "moderation": return Activity;
    default: return Activity;
  }
}

export default function ActivityPage() {
  const [items, setItems] = useState(loadUserActivity());
  const [filter, setFilter] = useState<"all" | ActivityType>("all");

  const visible = useMemo(() => {
    return filter === "all" ? items : items.filter((item) => item.type === filter);
  }, [filter, items]);

  const totals = useMemo(() => {
    return {
      all: items.length,
      posts: items.filter((i) => i.type === "post").length,
      comments: items.filter((i) => i.type === "comment" || i.type === "reply").length,
      reputation: items.reduce((sum, item) => sum + (item.points ?? 0), 0),
    };
  }, [items]);

  const clearAll = () => {
    clearUserActivity();
    setItems([]);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">User activity</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Activity History</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review your recent posts, comments, replies, saved posts, joined SubDiscourses, reputation changes, and moderation actions.
            </p>
          </div>
          <button onClick={clearAll} className="rounded-full border px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">
            Clear history
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><b className="text-2xl">{totals.all}</b><p className="mt-1 text-sm text-slate-500">Total activities</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><b className="text-2xl">{totals.posts}</b><p className="mt-1 text-sm text-slate-500">Posts created</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><b className="text-2xl">{totals.comments}</b><p className="mt-1 text-sm text-slate-500">Comments and replies</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><b className="text-2xl">+{totals.reputation}</b><p className="mt-1 text-sm text-slate-500">Reputation points</p></div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f ? "bg-blue-800 text-white" : "border bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {f === "all" ? "All" : activityLabel(f)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {visible.length ? visible.map((item) => {
          const Icon = iconFor(item.type);
          const card = (
            <article className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{activityLabel(item.type)}</span>
                    <span>{relativeTime(item.createdAt)}</span>
                    {item.points ? <span className="text-blue-700">+{item.points} pts</span> : null}
                  </div>
                  <h2 className="mt-2 text-lg font-black text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              </div>
            </article>
          );
          return item.href ? <Link key={item.id} href={item.href}>{card}</Link> : <div key={item.id}>{card}</div>;
        }) : (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <RefreshCw className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 text-xl font-black">No activity yet</h2>
            <p className="mt-2 text-sm text-slate-500">Your posts, comments, saves, joins, and reputation activity will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
