import { useMemo } from "react";
import { Link } from "wouter";
import { Activity, BarChart3, CheckCircle2, ShieldAlert, TrendingUp, Users } from "lucide-react";
import { loadAdminAnalytics, type HubAnalyticsRow } from "@/lib/admin-analytics";

function StatCard({ title, value, note, icon: Icon }: { title: string; value: string | number; note: string; icon: any }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <Icon className="mb-3 h-6 w-6 text-blue-700" />
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h2 className="mt-1 text-3xl font-black text-slate-950">{value}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function riskClass(risk: HubAnalyticsRow["risk"]) {
  if (risk === "High") return "bg-red-100 text-red-800";
  if (risk === "Medium") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export default function ModerationAnalytics() {
  const analytics = useMemo(() => loadAdminAnalytics(), []);
  const topHubs = [...analytics.hubRows].sort((a, b) => b.members - a.members).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <Link href="/moderation" className="text-sm font-bold text-blue-700">← Moderation Center</Link>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Stage 4D</p>
        <h1 className="mt-2 text-3xl font-black">Admin Analytics</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Track platform activity, moderation workload, SubDiscourse health, safety trends, and user-growth signals for CollegeDiscourse.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={analytics.totalUsers} note={`${analytics.activeUsers} active users in the local admin dataset.`} icon={Users} />
        <StatCard title="SubDiscourses" value={analytics.totalHubs} note="Active Hubs available for students and mentors." icon={BarChart3} />
        <StatCard title="Posts" value={analytics.totalPosts} note={`${analytics.totalComments} comments currently tracked.`} icon={Activity} />
        <StatCard title="Safety Score" value={`${analytics.safetyScore}%`} note={analytics.autoModerationEnabled ? "Auto moderation is enabled." : "Auto moderation is disabled."} icon={ShieldAlert} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <CheckCircle2 className="mb-3 h-6 w-6 text-blue-700" />
          <h2 className="text-lg font-black">Report Status</h2>
          <p className="mt-3 text-sm text-slate-600"><b>{analytics.openReports}</b> open or reviewing reports</p>
          <p className="mt-2 text-sm text-slate-600"><b>{analytics.resolvedReports}</b> resolved or dismissed reports</p>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Users className="mb-3 h-6 w-6 text-blue-700" />
          <h2 className="text-lg font-black">Moderator Workload</h2>
          <p className="mt-3 text-sm text-slate-600"><b>{analytics.activeModerators}</b> active moderators</p>
          <p className="mt-2 text-sm text-slate-600">Use this to decide where more moderators are needed.</p>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <TrendingUp className="mb-3 h-6 w-6 text-blue-700" />
          <h2 className="text-lg font-black">User Controls</h2>
          <p className="mt-3 text-sm text-slate-600"><b>{analytics.bannedUsers}</b> banned users</p>
          <p className="mt-2 text-sm text-slate-600"><b>{analytics.mutedUsers}</b> muted users</p>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">SubDiscourse Activity</h2>
            <p className="mt-1 text-sm text-slate-600">High-membership and reported Hubs should receive more moderator attention.</p>
          </div>
          <Link href="/moderation/users" className="rounded-full bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">
            Manage Users
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Hub</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Posts</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topHubs.map((hub) => (
                <tr key={hub.slug}>
                  <td className="px-4 py-3 font-bold text-slate-900"><Link href={`/d/${hub.slug}`} className="hover:text-blue-700">d/{hub.slug}</Link></td>
                  <td className="px-4 py-3 text-slate-600">{hub.members.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-600">{hub.posts}</td>
                  <td className="px-4 py-3 text-slate-600">{hub.reports}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${riskClass(hub.risk)}`}>{hub.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
