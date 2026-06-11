import { Link, useLocation } from "wouter";
import { Bell, Bookmark, Compass, Home, LogIn, MessageSquare, Plus, Search, ShieldCheck, UserCircle, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Home Feed", icon: Home },
    { href: "/communities", label: "Hubs", icon: Users },
    { href: "/create", label: "Create Post", icon: Plus },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/saved", label: "Saved Posts", icon: Bookmark },
    { href: "/resources", label: "Resources", icon: Bookmark },
    { href: "/moderation", label: "Moderation", icon: ShieldCheck },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-800 text-white">C</div>
            <span className="text-xl">CollegeDiscourse</span>
          </Link>

          <div className="hidden flex-1 items-center rounded-full border bg-slate-100 px-4 py-2 md:flex">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-500">Search posts, Hubs, scholarships, research help...</span>
          </div>

          <Link href="/create" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
            Create
          </Link>

          <Link href={isAuthenticated ? "/profile" : "/auth"} className="hidden items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 md:flex">
            {isAuthenticated ? <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-800 text-xs text-white">{user?.avatarInitials}</span> : <LogIn className="h-4 w-4" />}
            {isAuthenticated ? user?.displayName : "Login"}
          </Link>

          <button className="relative rounded-full border bg-white p-2 text-slate-600 hover:text-slate-950">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600" />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border bg-white p-3 shadow-sm">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold"><Compass className="h-5 w-5 text-blue-700" /> Today on CollegeDiscourse</div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <Link href="/d/scholarships" className="block rounded-xl px-3 py-2 hover:bg-blue-50"><b className="text-slate-900">38</b> scholarship replies today</Link>
                <Link href="/d/study-abroad" className="block rounded-xl px-3 py-2 hover:bg-blue-50"><b className="text-slate-900">12</b> new study-abroad questions</Link>
                <Link href="/d/research-help" className="block rounded-xl px-3 py-2 hover:bg-blue-50"><b className="text-slate-900">7</b> research methods discussions trending</Link>
              </div>
            </div>
            <Link href="/moderation" className="block rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
              <h3 className="font-bold">Hub Rules</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                <li>Be helpful and respectful.</li>
                <li>No fake scholarships, spam, or paid-agent bait.</li>
                <li>Use clear titles and include country/context.</li>
                <li>Protect private information.</li>
              </ol>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
