import { Cake, CheckCircle2, GraduationCap, Medal, ShieldCheck, Sparkles } from "lucide-react";
import { getPublicProfile, joinedLabel, slugifyUser } from "@/lib/user-profiles-store";

export function getUserIdentity(name: string) {
  const normalized = slugifyUser(name);
  const profile = getPublicProfile(normalized);

  if (!profile) {
    return {
      karma: 240,
      flair: "Member",
      communityFlair: "CollegeDiscourse",
      joined: "Joined recently",
      verified: false,
      mentor: false,
      moderator: false,
    };
  }

  const role = profile.role.toLowerCase();

  return {
    karma: profile.reputation,
    flair: profile.role,
    communityFlair: profile.joinedRooms[0] ?? "CollegeDiscourse",
    joined: joinedLabel(profile.joinedDate),
    verified: profile.achievements.some((item) => item.toLowerCase().includes("verified")),
    mentor: role.includes("mentor") || role.includes("advisor"),
    moderator: profile.achievements.some((item) => item.toLowerCase().includes("moderator")) || name === "MethodMentor",
  };
}

export function IdentityBadges({ name }: { name: string }) {
  const identity = getUserIdentity(name);

  return (
    <>
      {identity.verified ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-800">
          <CheckCircle2 className="h-3 w-3" />
          Verified
        </span>
      ) : null}

      {identity.mentor ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[10px] font-black text-purple-800">
          <GraduationCap className="h-3 w-3" />
          Mentor
        </span>
      ) : null}

      {identity.moderator ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-800">
          <ShieldCheck className="h-3 w-3" />
          Moderator
        </span>
      ) : null}

      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-700">
        <Sparkles className="h-3 w-3" />
        Flair: {identity.communityFlair}
      </span>

      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-[10px] font-black text-yellow-800">
        <Cake className="h-3 w-3" />
        Cake Day: {identity.joined}
      </span>
    </>
  );
}

export function ContributorRibbon({ name }: { name: string }) {
  const identity = getUserIdentity(name);

  if (identity.karma >= 1800) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-900">
        <Medal className="h-3.5 w-3.5" />
        Top Contributor
      </span>
    );
  }

  if (identity.karma >= 1000) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
        <ShieldCheck className="h-3.5 w-3.5" />
        Trusted Contributor
      </span>
    );
  }

  return null;
}
