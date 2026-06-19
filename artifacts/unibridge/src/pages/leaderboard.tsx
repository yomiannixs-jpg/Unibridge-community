import { Link } from "wouter";
import { Award, Crown, Flame, Users } from "lucide-react";
import { loadPublicProfiles } from "@/lib/user-profiles-store";
import { ContributorRibbon } from "@/components/user-identity";

export default function LeaderboardPage() {
  const profiles = loadPublicProfiles()
    .slice()
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-700" />
          <div>
            <h1 className="text-3xl font-black">Top Contributors</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reddit-style community reputation, mentor identity, and contribution rankings.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {profiles.map((profile, index) => (
          <Link
            key={profile.id}
            href={`/u/${profile.slug}`}
            className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
                  {profile.avatar}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black">{index + 1}. {profile.name}</h2>
                    <ContributorRibbon name={profile.name} />
                  </div>
                  <p className="text-sm text-blue-700">{profile.handle}</p>
                  <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-emerald-50 px-4 py-2">
                  <Flame className="mx-auto h-4 w-4 text-emerald-700" />
                  <p className="text-sm font-black text-emerald-800">{profile.reputation}</p>
                  <p className="text-[10px] font-bold text-emerald-700">karma</p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-2">
                  <Users className="mx-auto h-4 w-4 text-blue-700" />
                  <p className="text-sm font-black text-blue-800">{profile.followersCount}</p>
                  <p className="text-[10px] font-bold text-blue-700">followers</p>
                </div>
                <div className="rounded-2xl bg-yellow-50 px-4 py-2">
                  <Award className="mx-auto h-4 w-4 text-yellow-700" />
                  <p className="text-sm font-black text-yellow-800">{profile.awards.length}</p>
                  <p className="text-[10px] font-bold text-yellow-700">awards</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
