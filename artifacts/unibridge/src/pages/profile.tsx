import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  Bookmark,
  GraduationCap,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loadStore } from "@/lib/community-store";
import { loadReputationStore } from "@/lib/reputation-store";
import { loadSocialStore, timeAgoShort, type SocialStore } from "@/lib/social-store";

function StatCard({
  href,
  icon,
  label,
  value,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  const body = (
    <div className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="mb-3 text-blue-700">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="text-3xl font-black">{value}</h2>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [social, setSocial] = useState<SocialStore>(() => loadSocialStore());
  const [store, setStore] = useState(() => loadStore());
  const reputation = useMemo(() => loadReputationStore(), []);

  useEffect(() => {
    const sync = () => {
      setSocial(loadSocialStore());
      setStore(loadStore());
    };

    window.addEventListener("collegediscourse-social-updated", sync);
    window.addEventListener("unibridge-store-updated", sync);

    return () => {
      window.removeEventListener("collegediscourse-social-updated", sync);
      window.removeEventListener("unibridge-store-updated", sync);
    };
  }, []);

  const currentUser = user ?? {
    id: "demo-user",
    name: "Demo Student",
    email: "demo@collegediscourse.app",
    role: "Verified User",
    reputation: 240,
    country: "Nigeria",
    institution: "CollegeDiscourse Demo University",
    degreeLevel: "Graduate Applicant",
    fieldOfStudy: "Education and Research",
    bio: "Exploring scholarships, research support, and study-abroad opportunities on CollegeDiscourse.",
    interests: ["Scholarships", "Research Help", "Study Abroad"],
    skills: ["Writing", "Research", "Applications"],
    joinedHubs: ["scholarships", "research-help"],
    savedPosts: [],
  };

  const joinedHubs = store.communities.filter((hub) =>
    (store.joined ?? currentUser.joinedHubs ?? []).includes(hub.slug),
  );

  const savedCount = store.saved?.length ?? currentUser.savedPosts?.length ?? 0;
  const reputationScore = reputation.score || currentUser.reputation || 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-800 text-2xl font-black text-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-black">{currentUser.name}</h1>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                  {currentUser.role}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {reputationScore} reputation
                </span>
                {isAuthenticated && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Signed in
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/settings"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              <PenLine className="h-4 w-4" />
              Edit profile
            </Link>
            <Link
              href="/activity"
              className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"
            >
              <Activity className="h-4 w-4" />
              Activity
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard href="/reputation" icon={<Star className="h-6 w-6" />} label="Reputation" value={reputationScore} />
        <StatCard icon={<GraduationCap className="h-6 w-6" />} label="Joined SubDiscourses" value={joinedHubs.length} />
        <StatCard href="/saved" icon={<Bookmark className="h-6 w-6" />} label="Saved Posts" value={savedCount} />
        <StatCard href="/followers" icon={<Users className="h-6 w-6" />} label="Followers" value={social.followers.length} />
        <StatCard href="/following" icon={<UserPlus className="h-6 w-6" />} label="Following" value={social.following.length} />
        <StatCard href="/activity" icon={<PenLine className="h-6 w-6" />} label="Posts" value={social.postsCount} />
        <StatCard href="/activity" icon={<MessageCircle className="h-6 w-6" />} label="Comments" value={social.commentsCount} />
        <StatCard href="/privacy" icon={<ShieldCheck className="h-6 w-6" />} label="Privacy" value="Controls" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">About</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{currentUser.bio}</p>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div>
              <b className="text-slate-900">Country</b>
              <p>{currentUser.country}</p>
            </div>
            <div>
              <b className="text-slate-900">Degree Level</b>
              <p>{currentUser.degreeLevel}</p>
            </div>
            <div>
              <b className="text-slate-900">Institution</b>
              <p>{currentUser.institution}</p>
            </div>
            <div>
              <b className="text-slate-900">Field</b>
              <p>{currentUser.fieldOfStudy}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Interests</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(currentUser.interests ?? []).map((interest) => (
                <span key={interest} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(currentUser.skills ?? []).map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Joined SubDiscourses</h2>
            <p className="mt-1 text-sm text-slate-500">Your academic communities on CollegeDiscourse.</p>
          </div>
          <Link href="/hubs" className="rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
            Explore Hubs
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {joinedHubs.length ? (
            joinedHubs.map((hub) => (
              <Link
                key={hub.slug}
                href={`/d/${hub.slug}`}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 hover:bg-blue-100"
              >
                d/{hub.slug}
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">You have not joined any SubDiscourse yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-500">A quick snapshot of posts, follows, saves, and reputation activity.</p>
          </div>
          <Link href="/activity" className="rounded-full bg-blue-800 px-4 py-2 text-sm font-bold text-white hover:bg-blue-900">
            View all
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          {social.activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-slate-900">{activity.label}</div>
                <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-400">{timeAgoShort(activity.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
