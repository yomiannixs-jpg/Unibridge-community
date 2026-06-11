import { useMemo, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Shield, SlidersHorizontal, XCircle } from "lucide-react";
import {
  evaluateContent,
  loadAutoModerationSettings,
  saveAutoModerationSettings,
  type AutoModerationSettings,
} from "@/lib/auto-moderation";

export default function ModerationAuto() {
  const [settings, setSettings] = useState<AutoModerationSettings>(() => loadAutoModerationSettings());
  const [sample, setSample] = useState("Guaranteed scholarship available. DM me on WhatsApp and pay processing fee.");
  const result = useMemo(() => evaluateContent(sample, settings), [sample, settings]);

  const update = (patch: Partial<AutoModerationSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAutoModerationSettings(next);
  };

  const updateList = (field: "blockedWords" | "flaggedPatterns", value: string) => {
    update({ [field]: value.split("\n").map((x) => x.trim()).filter(Boolean) } as Partial<AutoModerationSettings>);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Stage 4C</p>
            <h1 className="mt-2 text-3xl font-black">Auto Moderation</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Configure automatic checks for scam scholarships, paid-agent posts, blocked words, duplicate-like posts, and unsafe discussion patterns.
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-bold ${settings.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {settings.enabled ? "Enabled" : "Disabled"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["enabled", "Auto moderation", Shield],
          ["scamDetection", "Scam detection", AlertTriangle],
          ["antiAgentMode", "Anti-agent mode", Bot],
          ["duplicateDetection", "Duplicate detection", SlidersHorizontal],
        ].map(([key, label, Icon]) => {
          const checked = Boolean(settings[key as keyof AutoModerationSettings]);
          return (
            <button
              key={String(key)}
              onClick={() => update({ [key]: !checked } as Partial<AutoModerationSettings>)}
              className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-300 ${checked ? "ring-2 ring-blue-100" : ""}`}
            >
              <Icon className="mb-3 h-6 w-6 text-blue-700" />
              <div className="font-black">{String(label)}</div>
              <div className={`mt-2 text-sm font-bold ${checked ? "text-emerald-700" : "text-slate-500"}`}>{checked ? "On" : "Off"}</div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Blocked words and phrases</h2>
          <p className="mt-2 text-sm text-slate-600">One phrase per line. Matching posts should be blocked or sent for review.</p>
          <textarea
            value={settings.blockedWords.join("\n")}
            onChange={(e) => updateList("blockedWords", e.target.value)}
            className="mt-4 min-h-48 w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-300"
          />
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Flagged patterns</h2>
          <p className="mt-2 text-sm text-slate-600">Phrases that should trigger review but may not require automatic blocking.</p>
          <textarea
            value={settings.flaggedPatterns.join("\n")}
            onChange={(e) => updateList("flaggedPatterns", e.target.value)}
            className="mt-4 min-h-48 w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-300"
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Test content</h2>
        <textarea
          value={sample}
          onChange={(e) => setSample(e.target.value)}
          className="mt-4 min-h-32 w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-300"
        />
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 font-black">
            {result.recommendation === "allow" ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : result.recommendation === "review" ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            Recommendation: {result.recommendation.toUpperCase()} · Score {result.score}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {result.flags.length ? result.flags.map((flag) => <li key={flag}>{flag}</li>) : <li>No issues detected.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
