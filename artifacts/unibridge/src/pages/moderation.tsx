import { AlertTriangle, CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function Moderation() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Moderation Center</h1>
        <p className="mt-2 text-slate-600">A community platform needs trust controls: reports, moderators, pinned posts, user roles, and anti-spam workflows.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><AlertTriangle className="mb-3 h-7 w-7 text-blue-500" /><h2 className="font-black">Reports</h2><p className="mt-2 text-sm text-slate-600">3 posts awaiting review for spam or missing context.</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Users className="mb-3 h-7 w-7 text-blue-500" /><h2 className="font-black">Moderators</h2><p className="mt-2 text-sm text-slate-600">Assign trusted mentors and senior students to each community.</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><ShieldCheck className="mb-3 h-7 w-7 text-blue-500" /><h2 className="font-black">Safety</h2><p className="mt-2 text-sm text-slate-600">Block scams, false scholarships, impersonation, and agent spam.</p></div>
      </div>
      <div className="rounded-[2rem] border bg-white p-5 shadow-sm">
        <h2 className="font-black">Recommended moderation workflow</h2>
        <div className="mt-4 space-y-3">
          {["Verify scholarships before pinning", "Require country/level/deadline tags", "Flag repeated agent-style messages", "Allow mentor-only announcements"].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{item}</div>)}
        </div>
      </div>
    </div>
  );
}
