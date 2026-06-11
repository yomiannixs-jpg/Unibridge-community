import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, Check, Eye, Plus, Trash2, X } from "lucide-react";
import { addReport, clearResolvedReports, loadModerationStore, saveModerationStore, updateReportStatus, type ModerationReport, type ReportStatus } from "@/lib/moderation-store";

const statusLabels: Record<ReportStatus, string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

function ReportCard({ report, onStatus }: { report: ModerationReport; onStatus: (id: string, status: ReportStatus) => void }) {
  return (
    <article className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">{report.targetType}</span>
            <span>d/{report.hubSlug}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">{statusLabels[report.status]}</span>
            <span className={report.priority === "high" ? "text-red-700" : report.priority === "medium" ? "text-blue-700" : "text-slate-500"}>{report.priority} priority</span>
          </div>
          <h2 className="mt-3 text-xl font-black">{report.targetTitle}</h2>
          <p className="mt-2 text-sm font-bold text-slate-700">{report.reason}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{report.details}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <button onClick={() => onStatus(report.id, "reviewing")} className="rounded-full border px-3 py-2 text-xs font-bold hover:bg-slate-100"><Eye className="mr-1 inline h-3 w-3" />Review</button>
          <button onClick={() => onStatus(report.id, "resolved")} className="rounded-full bg-blue-800 px-3 py-2 text-xs font-bold text-white hover:bg-blue-900"><Check className="mr-1 inline h-3 w-3" />Resolve</button>
          <button onClick={() => onStatus(report.id, "dismissed")} className="rounded-full border px-3 py-2 text-xs font-bold hover:bg-slate-100"><X className="mr-1 inline h-3 w-3" />Dismiss</button>
        </div>
      </div>
    </article>
  );
}

export default function ModerationReports() {
  const [store, setStore] = useState(loadModerationStore());
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const [reason, setReason] = useState("");
  const [targetTitle, setTargetTitle] = useState("");
  const [details, setDetails] = useState("");
  const [hubSlug, setHubSlug] = useState("scholarships");

  useEffect(() => {
    const sync = () => setStore(loadModerationStore());
    window.addEventListener("collegediscourse-moderation-updated", sync);
    return () => window.removeEventListener("collegediscourse-moderation-updated", sync);
  }, []);

  const reports = useMemo(() => filter === "all" ? store.reports : store.reports.filter((report) => report.status === filter), [filter, store.reports]);

  const updateStatus = (id: string, status: ReportStatus) => setStore(updateReportStatus(id, status));

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !targetTitle.trim()) return;
    setStore(addReport({
      targetType: "post",
      targetTitle: targetTitle.trim(),
      hubSlug,
      reason: reason.trim(),
      details: details.trim() || "No additional details provided.",
      priority: "medium",
    }));
    setReason(""); setTargetTitle(""); setDetails("");
  };

  const clearDone = () => setStore(clearResolvedReports());

  const resetDemo = () => {
    window.localStorage.removeItem("collegediscourse-moderation-v1");
    setStore(loadModerationStore());
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <Link href="/moderation" className="text-sm font-bold text-blue-700">← Moderation Center</Link>
        <h1 className="mt-3 text-3xl font-black">Reports Queue</h1>
        <p className="mt-2 text-slate-600">Review, resolve, or dismiss reported posts, comments, users, and Hubs.</p>
      </section>

      <form onSubmit={submitReport} className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black"><Plus className="h-5 w-5 text-blue-700" /> Manual report</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input value={targetTitle} onChange={(e) => setTargetTitle(e.target.value)} placeholder="Reported content title" className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
          <select value={hubSlug} onChange={(e) => setHubSlug(e.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300">
            {["scholarships", "study-abroad", "research-help", "phd-admissions", "career-launch"].map((slug) => <option key={slug} value={slug}>d/{slug}</option>)}
          </select>
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
        </div>
        <button className="mt-4 rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">Submit report</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {(["all", "open", "reviewing", "resolved", "dismissed"] as const).map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === item ? "bg-slate-950 text-white" : "border bg-white text-slate-600"}`}>{item}</button>
        ))}
        <button onClick={clearDone} className="rounded-full border bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"><Trash2 className="mr-1 inline h-4 w-4" />Clear done</button>
      </div>

      <div className="grid gap-4">
        {reports.length ? reports.map((report) => <ReportCard key={report.id} report={report} onStatus={updateStatus} />) : <div className="rounded-3xl border bg-white p-8 text-center text-slate-500">No reports in this view.</div>}
      </div>
    </div>
  );
}
