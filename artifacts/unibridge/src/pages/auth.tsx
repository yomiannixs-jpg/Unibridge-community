import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") signup({ name, email });
    else login(email, name);
    setLocation("/profile");
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-[2rem] border bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">CollegeDiscourse Account</p>
        <h1 className="mt-2 text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Join SubDiscourses, save posts, build reputation, and manage your student profile.</p>

        <div className="my-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button onClick={() => setMode("login")} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600"}`}>Login</button>
          <button onClick={() => setMode("signup")} className={`rounded-xl px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600"}`}>Sign up</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" ? (
            <div>
              <label className="text-sm font-bold text-slate-700">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            </div>
          ) : null}
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400" />
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">Prefer to explore first? <Link href="/" className="font-bold text-blue-700">Return home</Link></p>
      </div>
    </div>
  );
}
