import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@collegediscourse.app");
  const [password, setPassword] = useState("demo12345");
  const [username, setUsername] = useState("demo_student");
  const [displayName, setDisplayName] = useState("Demo Student");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!email || !password || !username) throw new Error("Email, username, and password are required.");
        await signup({ email, password, username, displayName });
      }
      setLocation("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid overflow-hidden rounded-[2rem] border bg-white shadow-sm md:grid-cols-[1fr_1.1fr]">
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-red-800 p-8 text-white md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-8 text-3xl font-black tracking-tight md:text-4xl">
            Join CollegeDiscourse
          </h1>
          <p className="mt-4 leading-7 text-slate-200">
            Create a profile, join SubDiscourses, save useful discussions, and take part in academic communities built for students, mentors, and researchers.
          </p>
          <div className="mt-8 rounded-3xl bg-white/10 p-5 text-sm ring-1 ring-white/20">
            <b>Demo login:</b>
            <p className="mt-2 text-slate-200">demo@collegediscourse.app</p>
            <p className="text-slate-200">Any password works in this local demo mode.</p>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 md:p-10">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${mode === "login" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"}`}
            >
              <LogIn className="h-4 w-4" /> Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${mode === "signup" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"}`}
            >
              <UserPlus className="h-4 w-4" /> Sign up
            </button>
          </div>

          <div className="mt-8 space-y-4">
            {mode === "signup" && (
              <>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Display name</span>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-300" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Username</span>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-300" />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-300" />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:border-blue-300" />
            </label>
          </div>

          {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          <button className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700">
            {mode === "login" ? "Login to CollegeDiscourse" : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Continue browsing without an account from the <Link href="/" className="font-bold text-blue-700">home feed</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
