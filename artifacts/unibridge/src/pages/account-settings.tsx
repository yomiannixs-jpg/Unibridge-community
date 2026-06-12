import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Save, ShieldCheck, UserCircle } from "lucide-react";
import { roleLabel, useAuth } from "@/lib/auth-context";

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, signup, updateProfile, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setBio(user.bio);
    }
  }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      signup({ name, email, bio });
      setLocation("/profile");
      return;
    }
    updateProfile({ name, bio });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>
        <h1 className="mt-4 text-3xl font-black">Account Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your CollegeDiscourse identity, profile details, role badge, and account foundation.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={submit} className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Profile details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" disabled={isAuthenticated} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 disabled:opacity-70" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
              <Save className="h-4 w-4" /> {isAuthenticated ? "Save changes" : "Create account"}
            </button>
            {saved ? <span className="ml-3 text-sm font-bold text-emerald-700">Saved</span> : null}
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
            <UserCircle className="h-9 w-9 text-blue-700" />
            <h3 className="mt-3 font-black">Account status</h3>
            <p className="mt-2 text-sm text-slate-600">{isAuthenticated ? "Signed in locally" : "Create a local-first account"}</p>
          </div>
          {user ? (
            <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
              <ShieldCheck className="h-9 w-9 text-blue-700" />
              <h3 className="mt-3 font-black">Role badge</h3>
              <p className="mt-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">{roleLabel(user.role)}</p>
              <p className="mt-3 text-sm text-slate-600">Reputation: <b>{user.reputation}</b></p>
              <button onClick={logout} className="mt-4 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Logout</button>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
