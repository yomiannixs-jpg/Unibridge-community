import { AtSign, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { loadMentions, markAllMentionsRead, markMentionRead, mentionTimeAgo, type MentionNotification } from "@/lib/mention-store";
import { MentionText, UserHoverCard } from "@/components/user-hover-card";

export default function MentionsPage() {
  const [mentions, setMentions] = useState<MentionNotification[]>(() => loadMentions());

  useEffect(() => {
    const sync = () => setMentions(loadMentions());
    window.addEventListener("collegediscourse-mentions-updated", sync);
    return () => window.removeEventListener("collegediscourse-mentions-updated", sync);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <AtSign className="h-8 w-8 text-blue-700" />
            <div>
              <h1 className="text-3xl font-black">Mentions</h1>
              <p className="mt-2 text-sm text-slate-600">See where people mention you in comments and replies.</p>
            </div>
          </div>
          <button onClick={() => setMentions(markAllMentionsRead())} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        {mentions.map((mention) => (
          <article key={mention.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${mention.read ? "" : "border-blue-300 bg-blue-50/40"}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <UserHoverCard name={mention.from} />
                  <span className="text-slate-500">mentioned you</span>
                  <span className="text-xs font-bold text-slate-400">{mentionTimeAgo(mention.createdAt)}</span>
                  {!mention.read ? <span className="rounded-full bg-blue-800 px-2 py-1 text-[10px] font-black text-white">NEW</span> : null}
                </div>
                <h2 className="mt-3 font-black">{mention.postTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  <MentionText text={mention.body} />
                </p>
              </div>
              <button onClick={() => setMentions(markMentionRead(mention.id))} className="shrink-0 rounded-full border px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-100">
                Mark read
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
