import { Link, useRoute } from "wouter";
import { Activity, CalendarDays, MessageCircle, Star, Trophy, UserPlus, Users } from "lucide-react";
import {
  getPublicProfile,
  getPublicProfilePresence,
  joinedLabel,
  loadProfilePosts,
  loadProfileReplies,
  loadProfileReputation,
  profileTimeAgo,
} from "@/lib/user-profiles-store";
import { isFollowing, loadSocialStore, toggleFollowPerson } from "@/lib/social-store";
import { PresenceBadge, PresenceDot } from "@/components/presence-badge";
import { useMemo, useState } from "react";

const tabs = ["Posts", "Replies", "Rooms", "Reputation", "People"] as const;

export default function PublicProfilePage() {
  const [, params] = useRoute("/u/:slug");
  const profile = params?.slug ? getPublicProfile(params.slug) : undefined;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Posts");
  const [, forceRender] = useState(0);
  const social = useMemo(() => loadSocialStore(), []);

  if (!profile) {
    return (
      <section className="rounded-[2rem] border bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black">Profile not found</h1>
        <p className="mt-2 text-slate-600">This public profile does not exist.</p>
        <Link href="/followers" className="mt-5 inline-flex rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white">
          Browse people
        </Link>
      </section>
    );
  }

  const presence = getPublicProfilePresence(profile.name);
  const followed = isFollowing(profile.id);
  const posts = loadProfilePosts(profile);
  const replies = loadProfileReplies(profile);
  const reputationEvents = loadProfileReputation(profile);

  const handleFollow = () => {
    toggleFollowPerson(profile);
    forceRender((value) => value + 1);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className={`h-32 bg-gradient-to-r ${profile.bannerGradient}`} />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.8rem] border-4 border-white bg-blue-800 text-4xl font-black text-white shadow-sm">
                {profile.avatar}
                <span className="absolute -bottom-1 -right-1">
                  <PresenceDot status={presence?.status ?? "offline"} />
                </span>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-black">{profile.name}</h1>
                <p className="text-sm text-blue-700">{profile.handle}</p>
                <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleFollow} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${followed ? "bg-blue-50 text-blue-800 hover:bg-blue-100" : "bg-blue-800 text-white hover:bg-blue-900"}`}>
                <UserPlus className="h-4 w-4" /> {followed ? "✓ Following" : "Follow"}
              </button>
              <Link href="/messages" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                <MessageCircle className="h-4 w-4" /> Message
              </Link>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <PresenceBadge status={presence?.status ?? "offline"} lastSeen={presence?.lastSeen} />
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <CalendarDays className="h-3.5 w-3.5" /> {joinedLabel(profile.joinedDate)}
            </span>
            {profile.awards.map((award, index) => (
              <span key={`${award}-${index}`} className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-black text-yellow-800">{award}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Star className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Reputation</p><h2 className="text-3xl font-black">{profile.reputation}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Activity className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Posts</p><h2 className="text-3xl font-black">{profile.posts}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><MessageCircle className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Comments</p><h2 className="text-3xl font-black">{profile.comments}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><Users className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Followers</p><h2 className="text-3xl font-black">{profile.followersCount}</h2></div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm"><UserPlus className="mb-3 h-6 w-6 text-blue-700" /><p className="text-sm text-slate-500">Following</p><h2 className="text-3xl font-black">{profile.followingCount}</h2></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">About</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{profile.bio}</p>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div><b className="text-slate-900">Country</b><p>{profile.country}</p></div>
            <div><b className="text-slate-900">Institution</b><p>{profile.institution}</p></div>
            <div><b className="text-slate-900">Field</b><p>{profile.field}</p></div>
            <div><b className="text-slate-900">Role</b><p>{profile.role}</p></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Achievements</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.achievements.map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-800"><Trophy className="h-3.5 w-3.5" />{item}</span>)}
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Interests</h2>
            <div className="mt-4 flex flex-wrap gap-2">{profile.interests.map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{item}</span>)}</div>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">{profile.skills.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"}`}>{tab}</button>)}
        </div>
      </section>

      {activeTab === "Posts" && <section className="grid gap-4">{posts.map((post) => <article key={post.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500"><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">{post.room}</span><span>{profileTimeAgo(post.createdAt)}</span></div><h2 className="mt-3 text-xl font-black">{post.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p><div className="mt-4 flex gap-4 text-sm font-bold text-slate-500"><span>{post.replies} replies</span><span>{post.upvotes} upvotes</span></div></article>)}</section>}

      {activeTab === "Replies" && <section className="grid gap-4">{replies.map((reply) => <article key={reply.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500"><span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">{reply.room}</span><span>{profileTimeAgo(reply.createdAt)}</span></div><h2 className="mt-3 text-lg font-black">{reply.threadTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{reply.body}</p></article>)}</section>}

      {activeTab === "Rooms" && <section className="rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Joined Rooms</h2><div className="mt-4 flex flex-wrap gap-2">{profile.joinedRooms.map((room) => <span key={room} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{room}</span>)}</div></section>}

      {activeTab === "Reputation" && <section className="grid gap-4">{reputationEvents.map((event) => <article key={event.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="font-black">{event.label}</h2><p className="text-sm text-slate-500">{profileTimeAgo(event.createdAt)}</p></div><span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800">+{event.points}</span></div></article>)}</section>}

      {activeTab === "People" && <section className="grid gap-4 md:grid-cols-2">{[...social.followers, ...social.following].slice(0, 6).map((person) => <Link key={person.id} href={`/u/${person.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-3xl border bg-white p-5 shadow-sm hover:border-blue-300"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">{person.avatar}</div><div><h2 className="font-black">{person.name}</h2><p className="text-sm text-blue-700">{person.handle}</p><p className="text-sm text-slate-500">{person.role}</p></div></div></Link>)}</section>}
    </div>
  );
}
