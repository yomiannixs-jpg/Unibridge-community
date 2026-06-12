import { useEffect, useMemo, useState } from "react";
import { Circle, Clock, Radio, Users } from "lucide-react";
import {
  lastSeenLabel,
  loadPresenceUsers,
  presenceDotClass,
  presenceLabel,
  updateCurrentUserPresence,
  type PresenceStatus,
  type PresenceUser,
} from "@/lib/presence-store";

function UserPresenceCard({ user }: { user: PresenceUser }) {
  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
            {user.avatar}
          </div>
          <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${presenceDotClass(user.status)}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-black">{user.name}</h2>
          <p className="text-sm text-blue-700">{user.handle}</p>
          <p className="mt-1 text-sm text-slate-500">{user.role}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {presenceLabel(user.status)}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Last seen {lastSeenLabel(user.lastSeen)}
            </span>
            {user.currentRoom && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
                In {user.currentRoom}
              </span>
            )}
            {user.typing && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                Typing...
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PresencePage() {
  const [users, setUsers] = useState<PresenceUser[]>(() => loadPresenceUsers());
  const [filter, setFilter] = useState<"all" | PresenceStatus>("all");

  useEffect(() => {
    const sync = () => setUsers(loadPresenceUsers());
    window.addEventListener("collegediscourse-presence-updated", sync);
    return () => window.removeEventListener("collegediscourse-presence-updated", sync);
  }, []);

  const online = users.filter((user) => user.status === "online").length;
  const away = users.filter((user) => user.status === "away").length;
  const offline = users.filter((user) => user.status === "offline").length;

  const visibleUsers = useMemo(() => {
    return filter === "all" ? users : users.filter((user) => user.status === filter);
  }, [users, filter]);

  const setMyStatus = (status: PresenceStatus) => {
    setUsers(updateCurrentUserPresence(status));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <Radio className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Presence</span>
            </div>
            <h1 className="mt-3 text-3xl font-black">Who's online now</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              See online, away, offline, last-seen, and room activity signals across CollegeDiscourse.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-bold text-emerald-800">Online</p>
              <p className="text-2xl font-black">{online}</p>
            </div>
            <div className="rounded-2xl bg-yellow-50 px-4 py-3">
              <p className="text-xs font-bold text-yellow-800">Away</p>
              <p className="text-2xl font-black">{away}</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="text-xs font-bold text-slate-700">Offline</p>
              <p className="text-2xl font-black">{offline}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-black">Set your status</h2>
            <p className="text-sm text-slate-500">This is local-first for now and backend-ready later.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setMyStatus("online")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
              Online
            </button>
            <button onClick={() => setMyStatus("away")} className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-bold text-white">
              Away
            </button>
            <button onClick={() => setMyStatus("offline")} className="rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-white">
              Offline
            </button>
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "online", "away", "offline"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === item ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item === "all" ? "All" : presenceLabel(item)}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {visibleUsers.map((user) => (
          <UserPresenceCard key={user.id} user={user} />
        ))}
      </section>
    </div>
  );
}
