import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Award, Bookmark, GraduationCap, MapPin, Settings, Star, Users } from "lucide-react";
import { loadUserProfile, type UserProfile } from "@/lib/user-profile-store";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());

  useEffect(() => {
    const sync = () => setProfile(loadUserProfile());
    sync();
    window.addEventListener("collegediscourse-profile-updated", sync);
    return () => window.removeEventListener("collegediscourse-profile-updated", sync);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-800 text-2xl font-black text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black">{profile.displayName}</h1>
              <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{profile.role}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{profile.reputation} reputation</span>
              </div>
            </div>
          </div>
          <Link href="/account/settings" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold hover:bg-slate-100">
            <Settings className="h-4 w-4" /> Edit profile
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Star className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Reputation</p><h2 className="text-3xl font-black">{profile.reputation}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Users className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Joined SubDiscourses</p><h2 className="text-3xl font-black">{profile.joinedHubs.length}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Bookmark className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Saved Posts</p><h2 className="text-3xl font-black">{profile.savedPosts.length}</h2></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">About</h2>
          <p className="mt-3 leading-7 text-slate-700">{profile.bio}</p>
          <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-700" /> {profile.country}</p>
            <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-blue-700" /> {profile.degreeLevel}</p>
            <p className="flex items-center gap-2"><Award className="h-4 w-4 text-blue-700" /> {profile.institution}</p>
            <p><b>Field:</b> {profile.fieldOfStudy}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">Interests</h3><div className="mt-3 flex flex-wrap gap-2">{profile.interests.map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{item}</span>)}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">Skills</h3><div className="mt-3 flex flex-wrap gap-2">{profile.skills.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item}</span>)}</div></div>
        </aside>
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Academic goals</h2>
        <p className="mt-3 leading-7 text-slate-700">{profile.goals}</p>
      </section>
    </div>
  );
}
