import { Link } from "wouter";
import { BookOpen, FileText, GraduationCap, Search } from "lucide-react";

const resources = [
  { title: "Scholarship application checklist", type: "Template", community: "scholarships", icon: FileText, body: "Documents, deadlines, essays, recommendation letters, and follow-up tracker." },
  { title: "How to write a focused research question", type: "Guide", community: "research-help", icon: BookOpen, body: "A practical framework for turning broad ideas into testable questions." },
  { title: "Study abroad country comparison sheet", type: "Worksheet", community: "study-abroad", icon: GraduationCap, body: "Compare tuition, visa pathway, cost of living, work rights, and funding." },
  { title: "Professor email structure for PhD applicants", type: "Template", community: "phd-admissions", icon: FileText, body: "A clear, respectful outreach email structure with dos and don'ts." },
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Education Resource Library</h1>
        <p className="mt-2 text-slate-600">Reusable guides, templates, checklists, scholarship boards, research tools, and community-created resources.</p>
        <div className="mt-5 flex items-center rounded-full border bg-slate-50 px-4 py-3"><Search className="mr-2 h-5 w-5 text-slate-400" /><span className="text-sm text-slate-500">Search resource library...</span></div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map((r) => <article key={r.title} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><r.icon className="h-6 w-6" /></div><div><div className="flex gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{r.type}</span><Link href={`/d/${r.community}`} className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-800">d/{r.community}</Link></div><h2 className="mt-3 text-xl font-black">{r.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{r.body}</p></div></div></article>)}
      </div>
    </div>
  );
}
