import { Link } from "wouter";
import { AtSign, MessageCircle, UserPlus } from "lucide-react";
import { getPublicProfile, slugifyUser } from "@/lib/user-profiles-store";
import { isFollowing, toggleFollowPerson } from "@/lib/social-store";
import { useState } from "react";

export function UserActionMenu({
  name,
  onMention,
}: {
  name: string;
  onMention?: (username: string) => void;
}) {
  const slug = slugifyUser(name);
  const profile = getPublicProfile(slug);
  const [, rerender] = useState(0);

  if (name === "You") {
    return null;
  }

  const followed = profile ? isFollowing(profile.id) : false;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Link
        href={`/u/${slug}`}
        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-800"
      >
        View profile
      </Link>

      <Link
        href="/messages"
        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-800"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Message
      </Link>

      <button
        type="button"
        onClick={() => onMention?.(name)}
        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-800"
      >
        <AtSign className="h-3.5 w-3.5" />
        Mention
      </button>

      {profile ? (
        <button
          type="button"
          onClick={() => {
            toggleFollowPerson(profile);
            rerender((value) => value + 1);
          }}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${
            followed ? "bg-blue-50 text-blue-800" : "bg-blue-800 text-white"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {followed ? "Following" : "Follow"}
        </button>
      ) : null}
    </div>
  );
}
