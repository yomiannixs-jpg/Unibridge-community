import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flag, ShieldCheck, Trash2 } from "lucide-react";
import {
  clearResolvedReports,
  createReport,
  loadActions,
  loadReports,
  saveActions,
  type ModerationReport,
  updateReportStatus,
} from "@/lib/moderation-store";

function statusClass(status: ModerationReport["status"]) {
  if (status === "open") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-blue-50 text-blue-700";
  if (status === "resolved") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-600";
}

export default function Moderation() {
  const [reports, setReports] = useState(loadReports());
  const [actions, setActions] = useState(loadActions());
  const [filter, setFilter] = useState<"all" | ModerationReport["status"]>("all");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("Scholarship verification");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const sync = () => {
      setReports(loadReports());
      setActions(loadActions());
    };
    window.addEventListener("collegediscourse-moderation-updated", sync);
    return () => window.removeEventListener("collegediscourse-moderation-updated", sync);
  }, []);

  const filteredReports = useMemo(() => {
    return filter === "all" ? reports : reports.filter((report) => report.status === filter);
  }, [filter, reports]);

  const counts = useMemo(() => {
    return {
      open: reports.filter((r) => r.status === "open").length,
      reviewing: reports.filter((r) => r.status === "reviewing").length,
      resolved: reports.filter((r) => r.status === "resolved").length,
    };
  }, [reports]);

  const submitReport = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !details.trim()) return;
    const report = createReport({
      targetType: "post",
      targetId: `manual-${Date.now()}`,
      title: title.trim(),
      reason,
      details: details.trim(),
    });
    setReports([report, ...reports]);
    setTitle("");
    setDetails("");
  };

  const changeStatus = (id: string, status: ModerationReport["status"]) => {
    setReports(updateReportStatus(id, status));
  };

  const removeResolved = () => {
    setReports(clearResolvedReports());
  };

  const addAction = () => {
    const next = [
      {
        id: `a-${Date.now()}`,
        label: "Moderator review note",
        description: "Review reported content for accuracy, safety, tone, and source credibility before taking action.",
        createdAt: new Date().toISOString(),
      },
      ...actions,
    ];
    setActions(next);
    saveActions(next);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-900 to-red-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Moderator tools</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Keep CollegeDiscourse useful and trustworthy.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Review reports, verify scholarship posts, track suspicious content, and document moderation rules for each SubDiscourse.
            </p>
          </div>
          <ShieldCheck className="h-16 w-16 text-blue-200" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Open reports</p>
          <h2 className="mt-2 text-4xl font-black text-red-700">{counts.open}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Under review</p>
          <h2 className="mt-2 text-4xl font-black text-blue-700">{counts.reviewing}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Resolved</p>
          <h2 className="mt-2 text-4xl font-black text-emerald-700">{counts.resolved}</h2>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "open", "reviewing", "resolved", "dismissed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === status ? "bg-blue-800 text-white" : "border bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
            <button onClick={removeResolved} className="rounded-full border bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Clear resolved
            </button>
          </div>

          {filteredReports.map((report) => (
            <article key={report.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(report.status)}`}>{report.status}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{report.reason}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{report.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{report.details}</p>
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    Target: {report.targetType} · {report.targetId}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button onClick={() => changeStatus(report.id, "reviewing")} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    Review
                  </button>
                  <button onClick={() => changeStatus(report.id, "resolved")} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    Resolve
                  </button>
                  <button onClick={() => changeStatus(report.id, "dismissed")} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                    Dismiss
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <form onSubmit={submitReport} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 font-black"><Flag className="h-5 w-5 text-red-700" /> Create report</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Report title" className="mt-4 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-3 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300">
              <option>Scholarship verification</option>
              <option>Spam / solicitation</option>
              <option>Harassment</option>
              <option>Low-quality content</option>
              <option>Privacy concern</option>
            </select>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the issue" className="mt-3 min-h-28 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
            <button className="mt-3 w-full rounded-2xl bg-blue-800 px-4 py-3 text-sm font-bold text-white hover:bg-blue-900">Submit report</button>
          </form>

          <div className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">Moderation checklist</h3>
              <button onClick={addAction} className="rounded-full border px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50">Add</button>
            </div>
            <div className="mt-4 space-y-3">
              {actions.map((action) => (
                <div key={action.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4 text-emerald-700" /> {action.label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
