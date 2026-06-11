import { Link } from "wouter";
import { AlertTriangle, CheckCircle2, ShieldCheck, UserCog, Lock, ArrowRight } from "lucide-react";
import { loadModerationStore } from "@/lib/moderation-store";

export default function Moderation() {
  const store = loadModerationStore();
  const openReports = store.reports.filter((report) => report.status === "open").length;
  const reviewingReports = store.reports.filter((report) => report.status === "reviewing").length;
  const activeModerators = store.moderators.filter((moderator) => moderator.active).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Stage 4A</p>
        <h1 className="mt-2 text-3xl font-black">Moderation Center</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Review reports, assign moderators, configure safety controls, and manage trust workflows for CollegeDiscourse.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/moderation/reports" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <AlertTriangle className="mb-3 h-7 w-7 text-blue-700" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Reports</h2>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm text-slate-600">{openReports} open, {reviewingReports} under review.</p>
        </Link>

        <Link href="/moderation/moderators" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <UserCog className="mb-3 h-7 w-7 text-blue-700" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Moderators</h2>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm text-slate-600">{activeModerators} active moderators across Hubs.</p>
        </Link>

        <Link href="/moderation/safety" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <Lock className="mb-3 h-7 w-7 text-blue-700" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Safety</h2>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm text-slate-600">Anti-agent mode, blocked terms, and posting limits.</p>
        </Link>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Recommended moderation workflow</h2>
        <div className="mt-4 grid gap-3">
          {["Review open reports daily", "Verify scholarships before pinning", "Require country, level, and deadline tags", "Move suspicious posts to Reviewing", "Resolve or dismiss reviewed reports"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black"><ShieldCheck className="h-5 w-5 text-blue-700" /> Quick actions</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/moderation/reports" className="rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">Open reports</Link>
          <Link href="/moderation/moderators" className="rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">Assign moderator</Link>
          <Link href="/moderation/safety" className="rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">Safety settings</Link>
        </div>
      </section>
    </div>
  );
}
