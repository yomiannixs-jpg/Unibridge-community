import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { isFollowing, loadSocialStore, toggleFollowPerson, type SocialPerson, type SocialStore } from "@/lib/social-store";
import { loadPresenceUsers } from "@/lib/presence-store";
import { PresenceBadge, PresenceDot } from "@/components/presence-badge";

function FollowingCard({ person, onToggle }: { person: SocialPerson; onToggle: (person: SocialPerson) => void }) {
  const presence = loadPresenceUsers().find((user) => user.name === person.name);
  const followed = isFollowing(person.id);

  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
            {person.avatar}
            <span className="absolute -bottom-1 -right-1">
              <PresenceDot status={presence?.status ?? "offline"} />
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-black">{person.name}</h2>
            <p className="text-sm text-blue-700">{person.handle}</p>
            <p className="mt-1 text-sm text-slate-500">{person.role}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <PresenceBadge status={presence?.status ?? "offline"} lastSeen={presence?.lastSeen} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {person.reputation} reputation
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle(person);
          }}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
            followed ? "bg-blue-50 text-blue-800 hover:bg-blue-100" : "bg-blue-800 text-white hover:bg-blue-900"
          }`}
        >
          {followed ? "✓ Following" : "Follow"}
        </button>
      </div>
    </article>
  );
}

export default function FollowingPage() {
  const [store, setStore] = useState<SocialStore>(() => loadSocialStore());

  useEffect(() => {
    const sync = () => setStore(loadSocialStore());
    window.addEventListener("collegediscourse-social-updated", sync);
    return () => window.removeEventListener("collegediscourse-social-updated", sync);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-700" />
          <div>
            <h1 className="text-3xl font-black">People you follow</h1>
            <p className="mt-2 text-sm text-slate-600">Manage the mentors, contributors, and students you are following.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {store.following.length ? (
          store.following.map((person) => (
            <FollowingCard key={person.id} person={person} onToggle={(p) => setStore(toggleFollowPerson(p))} />
          ))
        ) : (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500 shadow-sm">You are not following anyone yet.</div>
        )}
      </section>
    </div>
  );
}
