import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Save, UserCircle } from "lucide-react";
import {
  loadUserProfile,
  parseProfileLists,
  profileStorageMode,
  saveUserProfile,
  toCommaList,
  type UserProfile,
} from "@/lib/user-profile-store";

export default function AccountSettings() {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadUserProfile();
    setProfile(loaded);
    setInterests(toCommaList(loaded.interests));
    setSkills(toCommaList(loaded.skills));
  }, []);

  const update = (key: keyof UserProfile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = parseProfileLists(profile, interests, skills);
    saveUserProfile(next);
    setProfile(next);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Account Settings</p>
            <h1 className="mt-2 text-3xl font-black">Edit your CollegeDiscourse profile</h1>
            <p className="mt-2 text-sm text-slate-600">
              Profile fields are ready for database persistence and currently save safely in local storage.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">{profileStorageMode()}</span>
        </div>
      </section>

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4 rounded-[2rem] border bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              Display name
              <input value={profile.displayName} onChange={(e) => update("displayName", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Email
              <input value={profile.email} onChange={(e) => update("email", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Country
              <input value={profile.country} onChange={(e) => update("country", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Institution
              <input value={profile.institution} onChange={(e) => update("institution", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Degree level
              <input value={profile.degreeLevel} onChange={(e) => update("degreeLevel", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Field of study
              <input value={profile.fieldOfStudy} onChange={(e) => update("fieldOfStudy", e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
            </label>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            Bio
            <textarea value={profile.bio} onChange={(e) => update("bio", e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Interests, comma separated
            <input value={interests} onChange={(e) => { setInterests(e.target.value); setSaved(false); }} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Skills, comma separated
            <input value={skills} onChange={(e) => { setSkills(e.target.value); setSaved(false); }} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Academic goals
            <textarea value={profile.goals} onChange={(e) => update("goals", e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-400" />
          </label>

          <button className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            <Save className="h-4 w-4" /> Save profile
          </button>
          {saved && <span className="ml-3 text-sm font-bold text-emerald-700">Saved successfully.</span>}
        </section>

        <aside className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <UserCircle className="h-12 w-12 text-blue-700" />
          <h2 className="mt-3 text-2xl font-black">Public preview</h2>
          <p className="mt-1 text-sm text-slate-500">{profile.role} · {profile.reputation} reputation</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><b>Name:</b> {profile.displayName}</p>
            <p><b>Country:</b> {profile.country}</p>
            <p><b>Institution:</b> {profile.institution}</p>
            <p><b>Degree:</b> {profile.degreeLevel}</p>
            <p><b>Field:</b> {profile.fieldOfStudy}</p>
          </div>
          <Link href="/profile" className="mt-5 inline-flex rounded-full border px-4 py-2 text-sm font-bold hover:bg-slate-100">View profile</Link>
        </aside>
      </form>
    </div>
  );
}
