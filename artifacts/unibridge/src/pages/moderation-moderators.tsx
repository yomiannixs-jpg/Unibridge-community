import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, ShieldCheck, UserCog } from "lucide-react";
import { addModerator, loadModerationStore, toggleModerator, type Moderator } from "@/lib/moderation-store";

export default function ModerationModerators() {
  const [store, setStore] = useState(loadModerationStore());
  const [name, setName] = useState("");
  const [hubSlug, setHubSlug] = useState("scholarships");
  const [role, setRole] = useState<Moderator["role"]>("Moderator");

  useEffect(() => {
    const sync = () => setStore(loadModerationStore());
    window.addEventListener("collegediscourse-moderation-updated", sync);
    return () => window.removeEventListener("collegediscourse-moderation-updated", sync);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStore(addModerator(name.trim(), hubSlug, role));
    setName("");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <Link href="/moderation" className="text-sm font-bold text-blue-700">← Moderation Center</Link>
        <h1 className="mt-3 text-3xl font-black">Moderator Management</h1>
        <p className="mt-2 text-slate-600">Assign trusted mentors and senior students to help manage each SubDiscourse.</p>
      </section>

      <form onSubmit={submit} className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black"><Plus className="h-5 w-5 text-blue-700" /> Add moderator</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Moderator name" className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
          <select value={hubSlug} onChange={(e) => setHubSlug(e.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300">
            {["all", "scholarships", "study-abroad", "research-help", "phd-admissions", "career-launch"].map((slug) => <option key={slug} value={slug}>{slug === "all" ? "All Hubs" : `d/${slug}`}</option>)}
          </select>
          <select value={role} onChange={(e) => setRole(e.target.value as Moderator["role"])} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300">
            <option>Moderator</option>
            <option>Mentor Moderator</option>
            <option>Super Admin</option>
          </select>
        </div>
        <button className="mt-4 rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">Add moderator</button>
      </form>

      <section className="grid gap-4">
        {store.moderators.map((moderator) => (
          <article key={moderator.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800"><UserCog className="h-6 w-6" /></div>
                <div>
                  <h2 className="font-black">{moderator.name}</h2>
                  <p className="text-sm text-slate-600">{moderator.role} • {moderator.hubSlug === "all" ? "All Hubs" : `d/${moderator.hubSlug}`}</p>
                </div>
              </div>
              <button onClick={() => setStore(toggleModerator(moderator.id))} className={`rounded-full px-4 py-2 text-sm font-bold ${moderator.active ? "bg-blue-800 text-white" : "border text-slate-600"}`}>
                <ShieldCheck className="mr-1 inline h-4 w-4" /> {moderator.active ? "Active" : "Inactive"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
