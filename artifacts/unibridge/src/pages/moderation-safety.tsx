import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Lock, Save } from "lucide-react";
import { loadModerationStore, saveSafetySettings, type SafetySettings } from "@/lib/moderation-store";

export default function ModerationSafety() {
  const [settings, setSettings] = useState<SafetySettings>(loadModerationStore().safety);
  const [blockedText, setBlockedText] = useState(settings.blockedWords.join(", "));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = loadModerationStore().safety;
      setSettings(next);
      setBlockedText(next.blockedWords.join(", "));
    };
    window.addEventListener("collegediscourse-moderation-updated", sync);
    return () => window.removeEventListener("collegediscourse-moderation-updated", sync);
  }, []);

  const toggle = (key: keyof Pick<SafetySettings, "antiAgentMode" | "requireCountryDeadline" | "autoFlagRepeatedPosts">) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = () => {
    const next = {
      ...settings,
      blockedWords: blockedText.split(",").map((word) => word.trim()).filter(Boolean),
    };
    saveSafetySettings(next);
    setSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <Link href="/moderation" className="text-sm font-bold text-blue-700">← Moderation Center</Link>
        <h1 className="mt-3 text-3xl font-black">Safety Settings</h1>
        <p className="mt-2 text-slate-600">Configure anti-spam, blocked terms, and content-quality rules for CollegeDiscourse.</p>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-black"><Lock className="h-5 w-5 text-blue-700" /> Blocked terms</div>
        <p className="mt-2 text-sm text-slate-600">Comma-separated words or phrases that moderators should watch for.</p>
        <textarea value={blockedText} onChange={(e) => setBlockedText(e.target.value)} rows={4} className="mt-4 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button onClick={() => toggle("antiAgentMode")} className={`rounded-3xl border p-5 text-left shadow-sm ${settings.antiAgentMode ? "border-blue-300 bg-blue-50" : "bg-white"}`}>
          <b>Anti-agent mode</b>
          <p className="mt-2 text-sm text-slate-600">Flag paid-agent bait and repeated contact drops.</p>
        </button>
        <button onClick={() => toggle("requireCountryDeadline")} className={`rounded-3xl border p-5 text-left shadow-sm ${settings.requireCountryDeadline ? "border-blue-300 bg-blue-50" : "bg-white"}`}>
          <b>Require country/deadline</b>
          <p className="mt-2 text-sm text-slate-600">Encourage complete scholarship and admission posts.</p>
        </button>
        <button onClick={() => toggle("autoFlagRepeatedPosts")} className={`rounded-3xl border p-5 text-left shadow-sm ${settings.autoFlagRepeatedPosts ? "border-blue-300 bg-blue-50" : "bg-white"}`}>
          <b>Auto-flag repeats</b>
          <p className="mt-2 text-sm text-slate-600">Mark repeated spam-like posts for review.</p>
        </button>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <label className="text-sm font-bold text-slate-700">Posting limit per hour</label>
        <input type="number" min={1} max={50} value={settings.postingLimitPerHour} onChange={(e) => setSettings((current) => ({ ...current, postingLimitPerHour: Number(e.target.value) }))} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" />
      </section>

      <button onClick={save} className="rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"><Save className="mr-2 inline h-4 w-4" />{saved ? "Saved" : "Save safety settings"}</button>
    </div>
  );
}
