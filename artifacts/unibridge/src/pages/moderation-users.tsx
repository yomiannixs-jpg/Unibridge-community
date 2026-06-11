import { useMemo, useState } from "react";
import {
  addModerationUser,
  loadModerationUsers,
  saveModerationUsers,
  setUserRole,
  setUserStatus,
  type ModerationUser,
  type UserRole,
  type UserStatus,
} from "@/lib/moderation-users";
import { ShieldCheck, UserCog, UserPlus, Ban, Bell, CheckCircle2 } from "lucide-react";

const roles: UserRole[] = [
  "Super Admin",
  "Moderator",
  "Mentor",
  "Verified User",
  "Regular User",
];

const statuses: UserStatus[] = ["Active", "Warned", "Muted", "Banned"];

function badgeClass(value: string) {
  if (value === "Super Admin") return "bg-blue-900 text-white";
  if (value === "Moderator") return "bg-blue-100 text-blue-800";
  if (value === "Mentor") return "bg-emerald-100 text-emerald-800";
  if (value === "Verified User") return "bg-cyan-100 text-cyan-800";
  if (value === "Banned") return "bg-red-100 text-red-800";
  if (value === "Muted") return "bg-slate-200 text-slate-800";
  if (value === "Warned") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default function ModerationUsers() {
  const [users, setUsers] = useState<ModerationUser[]>(loadModerationUsers());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [filter, setFilter] = useState<"All" | UserStatus>("All");

  const visibleUsers = useMemo(() => {
    if (filter === "All") return users;
    return users.filter((user) => user.status === filter);
  }, [filter, users]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      moderators: users.filter((u) => ["Super Admin", "Moderator"].includes(u.role)).length,
      banned: users.filter((u) => u.status === "Banned").length,
      warned: users.filter((u) => u.status === "Warned").length,
    };
  }, [users]);

  const refresh = () => setUsers(loadModerationUsers());

  const createUser = () => {
    if (!name.trim() || !email.trim()) return;
    const next = addModerationUser({
      name: name.trim(),
      email: email.trim(),
      role: "Regular User",
      status: "Active",
      joinedHubs: [],
      reportsHandled: 0,
      reputation: 0,
    });
    setUsers(next);
    setName("");
    setEmail("");
  };

  const resetDemo = () => {
    window.localStorage.removeItem("collegediscourse-moderation-users-v1");
    setUsers(loadModerationUsers());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
              Moderator controls
            </p>
            <h1 className="mt-2 text-3xl font-black">User Roles and Controls</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Promote trusted users, mute harmful accounts, ban repeat offenders, and restore users after review.
            </p>
          </div>
          <button
            onClick={resetDemo}
            className="rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            Reset demo users
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <UserCog className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Total users</p>
          <h2 className="text-3xl font-black">{stats.total}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <ShieldCheck className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Admins/mods</p>
          <h2 className="text-3xl font-black">{stats.moderators}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Bell className="mb-3 h-6 w-6 text-amber-600" />
          <p className="text-sm text-slate-500">Warned</p>
          <h2 className="text-3xl font-black">{stats.warned}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Ban className="mb-3 h-6 w-6 text-red-700" />
          <p className="text-sm text-slate-500">Banned</p>
          <h2 className="text-3xl font-black">{stats.banned}</h2>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add user</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
          <button
            onClick={createUser}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"
          >
            <UserPlus className="h-4 w-4" /> Add
          </button>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black">Users</h2>
          <div className="flex flex-wrap gap-2">
            {(["All", ...statuses] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === item ? "bg-blue-800 text-white" : "border bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {visibleUsers.map((user) => (
            <article key={user.id} className="rounded-3xl border bg-slate-50 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">{user.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Reputation: <b>{user.reputation}</b> · Reports handled: <b>{user.reportsHandled}</b> · Joined:{" "}
                    <b>{user.joinedHubs.length}</b>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      setUserRole(user.id, e.target.value as UserRole);
                      refresh();
                    }}
                    className="rounded-2xl border bg-white px-3 py-2 text-sm font-bold"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <select
                    value={user.status}
                    onChange={(e) => {
                      setUserStatus(user.id, e.target.value as UserStatus);
                      refresh();
                    }}
                    className="rounded-2xl border bg-white px-3 py-2 text-sm font-bold"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const next = loadModerationUsers().map((candidate) =>
                        candidate.id === user.id ? { ...candidate, status: "Warned" as UserStatus } : candidate,
                      );
                      saveModerationUsers(next);
                      setUsers(next);
                    }}
                    className="rounded-2xl border px-3 py-2 text-sm font-bold hover:bg-amber-50"
                  >
                    Warn
                  </button>

                  <button
                    onClick={() => {
                      const next = loadModerationUsers().map((candidate) =>
                        candidate.id === user.id ? { ...candidate, status: "Banned" as UserStatus } : candidate,
                      );
                      saveModerationUsers(next);
                      setUsers(next);
                    }}
                    className="rounded-2xl border px-3 py-2 text-sm font-bold hover:bg-red-50"
                  >
                    Ban
                  </button>

                  <button
                    onClick={() => {
                      const next = loadModerationUsers().map((candidate) =>
                        candidate.id === user.id ? { ...candidate, status: "Active" as UserStatus } : candidate,
                      );
                      saveModerationUsers(next);
                      setUsers(next);
                    }}
                    className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2 text-sm font-bold hover:bg-emerald-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Restore
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
