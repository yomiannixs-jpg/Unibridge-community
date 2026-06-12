import { Link, useRoute } from "wouter";
import { Activity, MessageCircle, Star, UserPlus, Users } from "lucide-react";
import { getPublicProfile, getPublicProfilePresence } from "@/lib/user-profiles-store";
import { isFollowing, toggleFollowPerson } from "@/lib/social-store";
import { PresenceBadge, PresenceDot } from "@/components/presence-badge";
import { useState } from "react";

export default function PublicProfilePage() {
  const [, params] = useRoute("/u/:slug");
  const profile = params?.slug ? getPublicProfile(params.slug) : undefined;
  const [, forceRender] = useState(0);

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

  const handleFollow = () => {
    toggleFollowPerson(profile);
    forceRender((value) => value + 1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.7rem] bg-blue-800 text-3xl font-black text-white">
              {profile.avatar}
              <span className="absolute -bottom-1 -right-1">
                <PresenceDot status={presence?.status ?? "offline"} />
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-3xl font-black">{profile.name}</h1>
              <p className="text-sm text-blue-700">{profile.handle}</p>
              <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <PresenceBadge status={presence?.status ?? "offline"} lastSeen={presence?.lastSeen} />
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {profile.reputation} reputation
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleFollow}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold ${
                followed ? "bg-blue-50 text-blue-800 hover:bg-blue-100" : "bg-blue-800 text-white hover:bg-blue-900"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              {followed ? "✓ Following" : "Follow"}
            </button>

            <Link href="/messages" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
              <MessageCircle className="h-4 w-4" />
              Message
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Star className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Reputation</p>
          <h2 className="text-3xl font-black">{profile.reputation}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Activity className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Posts</p>
          <h2 className="text-3xl font-black">{profile.posts}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <MessageCircle className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Comments</p>
          <h2 className="text-3xl font-black">{profile.comments}</h2>
        </div>
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
            <h2 className="text-xl font-black">Interests</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((item) => (
                <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{item}</span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item}</span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Users className="h-5 w-5 text-blue-700" />
              Rooms
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.joinedRooms.map((room) => (
                <span key={room} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{room}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
