import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AtSign, CheckCheck, MessageCircle, Trash2 } from "lucide-react";
import {
  clearReadMentions,
  loadMentions,
  markAllMentionsRead,
  markMentionRead,
  mentionTimeAgo,
  type Mention,
} from "@/lib/mentions-store";

function MentionCard({ mention, onRead }: { mention: Mention; onRead: (id: string) => void }) {
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${mention.read ? "" : "border-blue-300"}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            {!mention.read && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">NEW</span>}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{mention.sourceType}</span>
            <span>{mentionTimeAgo(mention.createdAt)}</span>
          </div>
          <Link href={mention.sourceUrl}>
            <h2 className="mt-3 text-lg font-black text-slate-950 hover:text-blue-700">{mention.sourceTitle}</h2>
          </Link>
          <p className="mt-2 text-sm leading-6 text-slate-600">{mention.body}</p>
        </div>
        <button
          onClick={() => onRead(mention.id)}
          className="shrink-0 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          {mention.read ? "Read" : "Mark read"}
        </button>
      </div>
    </article>
  );
}

export default function MentionsPage() {
  const [mentions, setMentions] = useState<Mention[]>(() => loadMentions());
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    const sync = () => setMentions(loadMentions());
    window.addEventListener("collegediscourse-mentions-updated", sync);
    return () => window.removeEventListener("collegediscourse-mentions-updated", sync);
  }, []);

  const unreadCount = mentions.filter((mention) => !mention.read).length;

  const visibleMentions = useMemo(() => {
    if (filter === "unread") return mentions.filter((mention) => !mention.read);
    if (filter === "read") return mentions.filter((mention) => mention.read);
    return mentions;
  }, [mentions, filter]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <AtSign className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Mentions</span>
            </div>
            <h1 className="mt-3 text-3xl font-black">People mentioning you</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track posts, comments, and replies where someone tags you with @username.
            </p>
          </div>
          <div className="rounded-3xl bg-blue-50 px-5 py-4 text-center">
            <p className="text-sm font-bold text-blue-800">Unread</p>
            <p className="text-3xl font-black text-blue-950">{unreadCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "unread", "read"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === item ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item === "all" ? "All" : item === "unread" ? "Unread" : "Read"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMentions(markAllMentionsRead())}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
            <button
              onClick={() => setMentions(clearReadMentions())}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear read
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {visibleMentions.length ? (
          visibleMentions.map((mention) => (
            <MentionCard
              key={mention.id}
              mention={mention}
              onRead={(id) => setMentions(markMentionRead(id))}
            />
          ))
        ) : (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <MessageCircle className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 text-xl font-black">No mentions here</h2>
            <p className="mt-2 text-sm text-slate-500">When someone tags you with @username, it will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
