import { Link } from "wouter";
import { MessageCircle, Star, UserPlus } from "lucide-react";
import { getPublicProfile, getPublicProfilePresence, slugifyUser } from "@/lib/user-profiles-store";
import { isFollowing, toggleFollowPerson } from "@/lib/social-store";
import { PresenceBadge, PresenceDot } from "@/components/presence-badge";
import { useState } from "react";

export function UserHoverCard({ name }: { name: string }) {
  const slug = slugifyUser(name);
  const profile = getPublicProfile(slug);
  const [, rerender] = useState(0);

  if (!profile || name === "You") {
    return <span className="font-black text-slate-900">{name}</span>;
  }

  const presence = getPublicProfilePresence(profile.name);
  const followed = isFollowing(profile.id);

  return (
    <span className="group relative inline-flex">
      <Link href={`/u/${profile.slug}`} className="font-black text-blue-700 hover:underline">
        {profile.name}
      </Link>

      <div className="pointer-events-none absolute left-0 top-6 z-50 hidden w-80 rounded-3xl border bg-white p-4 text-left shadow-xl group-hover:block group-focus-within:block">
        <div className={`h-16 rounded-2xl bg-gradient-to-r ${profile.bannerGradient}`} />
        <div className="-mt-7 flex items-end gap-3 px-2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white bg-blue-800 text-xl font-black text-white">
            {profile.avatar}
            <span className="absolute -bottom-1 -right-1">
              <PresenceDot status={presence?.status ?? "offline"} />
            </span>
          </div>
          <div className="min-w-0 pb-1">
            <p className="truncate text-base font-black text-slate-950">{profile.name}</p>
            <p className="truncate text-xs text-blue-700">{profile.handle}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{profile.bio}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <PresenceBadge status={presence?.status ?? "offline"} lastSeen={presence?.lastSeen} />
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
            <Star className="h-3.5 w-3.5" />
            {profile.reputation} karma
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="text-sm font-black text-slate-950">{profile.posts}</p>
            <p className="text-[10px] font-bold text-slate-500">posts</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="text-sm font-black text-slate-950">{profile.followersCount}</p>
            <p className="text-[10px] font-bold text-slate-500">followers</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2">
            <p className="text-sm font-black text-slate-950">{profile.comments}</p>
            <p className="text-[10px] font-bold text-slate-500">comments</p>
          </div>
        </div>

        <div className="pointer-events-auto mt-3 flex gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleFollowPerson(profile);
              rerender((value) => value + 1);
            }}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-black ${
              followed ? "bg-blue-50 text-blue-800" : "bg-blue-800 text-white"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            {followed ? "Following" : "Follow"}
          </button>

          <Link href="/messages" className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
            <MessageCircle className="h-3.5 w-3.5" />
            Message
          </Link>
        </div>
      </div>
    </span>
  );
}

export function MentionText({ text }: { text: string }) {
  const parts = text.split(/(@[a-zA-Z0-9_-]+)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith("@")) return <span key={`${part}-${index}`}>{part}</span>;
        const username = part.slice(1);
        return (
          <Link key={`${part}-${index}`} href={`/u/${slugifyUser(username)}`} className="font-black text-blue-700 hover:underline">
            {part}
          </Link>
        );
      })}
    </>
  );
}
