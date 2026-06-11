import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Award, Bookmark, CalendarDays, Edit3, LogOut, MapPin, ShieldCheck, UserCircle, Users } from "lucide-react";
import { loadStore, timeAgo, toggleJoinedInStore } from "@/lib/community-store";
import { useAuth } from "@/lib/auth-context";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, updateProfile, toggleJoinedHub } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocationText] = useState(user?.location ?? "");
  const store = loadStore();

  const joinedHubs = useMemo(
    () => (store.communities ?? []).filter((community) => user?.joinedHubs.includes(community.slug)),
    [store.communities, user?.joinedHubs]
  );

  const savedPosts = useMemo(
    () => (store.posts ?? []).filter((post) => user?.savedPosts.includes(post.id)),
    [store.posts, user?.savedPosts]
  );

  const toggleHubMembership = (slug: string) => {
    toggleJoinedInStore(slug);
    toggleJoinedHub(slug);
  };

  if (!user) {
    return (
      <div className="rounded-[2rem] border bg-white p-8 text-center shadow-sm">
        <UserCircle className="mx-auto h-12 w-12 text-blue-700" />
        <h1 className="mt-4 text-2xl font-black">Create your CollegeDiscourse profile</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Login or sign up to join SubDiscourses, save useful posts, track your academic conversations, and build your reputation.
        </p>
        <Link href="/auth" className="mt-6 inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">
          Login or sign up
        </Link>
      </div>
    );
  }

  const saveProfile = () => {
    updateProfile({ displayName, bio, location });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-br from-blue-950 via-slate-900 to-red-800" />
        <div className="px-6 pb-6 md:px-8">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-800 text-3xl font-black text-white shadow-sm">
                {user.avatarInitials}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-black">{user.displayName}</h1>
                <p className="font-semibold text-slate-500">d/{user.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50">
                <Edit3 className="h-4 w-4" /> Edit profile
              </button>
              <button onClick={() => { logout(); setLocation("/"); }} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>

          {editing ? (
            <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Display name</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-300" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Location</span>
                <input value={location} onChange={(e) => setLocationText(e.target.value)} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-300" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Bio</span>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-300" />
              </label>
              <button onClick={saveProfile} className="w-fit rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Save profile</button>
            </div>
          ) : (
            <p className="mt-6 max-w-3xl leading-7 text-slate-600">{user.bio}</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Award className="mb-2 h-6 w-6 text-blue-700" /><b>{user.reputation}</b><p className="text-sm text-slate-500">Reputation points</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Users className="mb-2 h-6 w-6 text-blue-700" /><b>{user.joinedHubs.length}</b><p className="text-sm text-slate-500">Joined SubDiscourses</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Bookmark className="mb-2 h-6 w-6 text-blue-700" /><b>{user.savedPosts.length}</b><p className="text-sm text-slate-500">Saved posts</p></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><CalendarDays className="mb-2 h-6 w-6 text-blue-700" /><b>{timeAgo(user.joinedAt)}</b><p className="text-sm text-slate-500">Joined</p></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-black"><ShieldCheck className="h-5 w-5 text-blue-700" /> Your SubDiscourses</div>
          <div className="mt-4 grid gap-3">
            {(store.communities ?? []).map((community) => {
              const joined = user.joinedHubs.includes(community.slug);
              return (
                <div key={community.slug} className="flex items-center justify-between rounded-2xl border bg-slate-50 p-4">
                  <div>
                    <Link href={`/d/${community.slug}`} className="font-black hover:text-blue-700">d/{community.slug}</Link>
                    <p className="text-sm text-slate-500">{community.members.toLocaleString()} members</p>
                  </div>
                  <button onClick={() => toggleHubMembership(community.slug)} className={`rounded-full px-4 py-2 text-sm font-bold ${joined ? "bg-blue-100 text-blue-800" : "bg-red-600 text-white hover:bg-red-700"}`}>
                    {joined ? "Joined" : "Join"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-black"><Bookmark className="h-5 w-5 text-blue-700" /> Saved posts</div>
          <div className="mt-4 grid gap-3">
            {savedPosts.length ? savedPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="rounded-2xl border bg-slate-50 p-4 hover:border-blue-300">
                <div className="text-xs font-bold text-blue-700">d/{post.communitySlug}</div>
                <h3 className="mt-1 font-black">{post.title}</h3>
              </Link>
            )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">You have not saved any posts yet.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
