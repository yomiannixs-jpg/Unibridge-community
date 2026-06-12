import { useMemo, useState } from "react";
import { Bell, Eye, Lock, Mail, MessageSquare, RotateCcw, ShieldCheck, UserCog } from "lucide-react";
import {
  defaultPrivacySettings,
  loadPrivacySettings,
  resetPrivacySettings,
  savePrivacySettings,
  type PrivacySettings,
} from "@/lib/privacy-settings";

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-sm"
    >
      <span>
        <span className="block font-bold text-slate-950">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-blue-700" : "bg-slate-300"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>(() => loadPrivacySettings());
  const [saved, setSaved] = useState(false);

  const visibilityLabel = useMemo(() => {
    if (settings.profileVisibility === "public") return "Public profile";
    if (settings.profileVisibility === "members") return "Members only";
    return "Private profile";
  }, [settings.profileVisibility]);

  const update = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    savePrivacySettings(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const reset = () => {
    resetPrivacySettings();
    setSettings(defaultPrivacySettings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-900 to-red-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Account controls</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">Privacy & notifications</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Control what other CollegeDiscourse members can see, how people contact you, and which alerts you receive.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 text-sm font-bold ring-1 ring-white/20">
            <ShieldCheck className="mb-2 h-6 w-6" />
            {visibilityLabel}
          </div>
        </div>
      </section>

      {saved && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">Settings saved locally.</div>}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm lg:col-span-1">
          <Eye className="mb-3 h-6 w-6 text-blue-700" />
          <h2 className="text-xl font-black">Profile visibility</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose who can see your public academic profile.</p>
          <div className="mt-4 grid gap-2">
            {(["public", "members", "private"] as const).map((option) => (
              <button
                key={option}
                onClick={() => update("profileVisibility", option)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold capitalize transition ${
                  settings.profileVisibility === option ? "border-blue-700 bg-blue-50 text-blue-800" : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option === "members" ? "Members only" : option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <Toggle label="Show reputation" description="Display your reputation score and badges on your profile." checked={settings.showReputation} onChange={(v) => update("showReputation", v)} />
          <Toggle label="Show joined SubDiscourses" description="Let others see the Hubs you participate in." checked={settings.showJoinedHubs} onChange={(v) => update("showJoinedHubs", v)} />
          <Toggle label="Show saved posts" description="Make saved posts visible on your profile preview." checked={settings.showSavedPosts} onChange={(v) => update("showSavedPosts", v)} />
          <Toggle label="Show activity history" description="Display recent posts, comments, saves, and reputation activity." checked={settings.showActivityHistory} onChange={(v) => update("showActivityHistory", v)} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-black">Messaging</h2>
          </div>
          <div className="mt-4">
            <Toggle label="Allow direct messages" description="Let other members contact you privately." checked={settings.allowDirectMessages} onChange={(v) => update("allowDirectMessages", v)} />
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-black">Notification preferences</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Toggle label="Email notifications" description="Receive important account and moderation alerts by email when available." checked={settings.emailNotifications} onChange={(v) => update("emailNotifications", v)} />
            <Toggle label="Reply notifications" description="Notify me when someone replies to my posts or comments." checked={settings.replyNotifications} onChange={(v) => update("replyNotifications", v)} />
            <Toggle label="Mention notifications" description="Notify me when someone mentions my name or handle." checked={settings.mentionNotifications} onChange={(v) => update("mentionNotifications", v)} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-black">Digest frequency</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["never", "daily", "weekly"] as const).map((option) => (
            <button
              key={option}
              onClick={() => update("digestFrequency", option)}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${
                settings.digestFrequency === option ? "bg-blue-800 text-white" : "border bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-blue-700" />
            <div>
              <h2 className="text-xl font-black">Reset privacy settings</h2>
              <p className="text-sm text-slate-600">Restore the default CollegeDiscourse account preferences.</p>
            </div>
          </div>
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
            <RotateCcw className="h-4 w-4" /> Reset defaults
          </button>
        </div>
      </section>
    </div>
  );
}
