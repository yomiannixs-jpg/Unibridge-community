import { useEffect, useMemo, useState } from "react";
import { Check, UserPlus, Users } from "lucide-react";
import { loadFollowStore, saveFollowStore, toggleFollow, type FollowStore } from "@/lib/follow-store";

function PersonCard({
  user,
  following,
  onToggle,
}: {
  user: FollowStore["users"][number];
  following: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-black">{user.name}</h2>
            <p className="text-sm font-semibold text-blue-700">@{user.username}</p>
            <p className="mt-1 text-sm text-slate-500">{user.role}</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            following
              ? "bg-blue-50 text-blue-800 hover:bg-blue-100"
              : "bg-blue-800 text-white hover:bg-blue-900"
          }`}
        >
          {following ? (
            <span className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> Following</span>
          ) : (
            <span className="inline-flex items-center gap-1"><UserPlus className="h-4 w-4" /> Follow</span>
          )}
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{user.bio}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <span><b className="text-slate-900">{user.followers.toLocaleString()}</b> followers</span>
        <span><b className="text-slate-900">{user.following.toLocaleString()}</b> following</span>
        <span><b className="text-slate-900">{user.reputation.toLocaleString()}</b> reputation</span>
      </div>
    </article>
  );
}

export default function FollowersPage() {
  const [store, setStore] = useState(loadFollowStore());

  useEffect(() => {
    const sync = () => setStore(loadFollowStore());
    window.addEventListener("collegediscourse-follow-updated", sync);
    return () => window.removeEventListener("collegediscourse-follow-updated", sync);
  }, []);

  const followerUsers = useMemo(() => {
    const known = store.users.filter((u) => store.followers.includes(u.id));
    const suggestions = store.users.filter((u) => !store.followers.includes(u.id));
    return [...known, ...suggestions];
  }, [store.users, store.followers]);

  const handleToggle = (userId: string) => {
    const next = toggleFollow(store, userId);
    setStore(next);
    saveFollowStore(next);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-blue-700" />
          <div>
            <h1 className="text-3xl font-black">Followers and Suggested People</h1>
            <p className="mt-1 text-sm text-slate-600">
              See who follows you and discover mentors, contributors, and student helpers.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {followerUsers.map((user) => (
          <PersonCard
            key={user.id}
            user={user}
            following={store.following.includes(user.id)}
            onToggle={() => handleToggle(user.id)}
          />
        ))}
      </div>
    </div>
  );
}
