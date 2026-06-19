import { loadSocialStore, type SocialPerson } from "@/lib/social-store";
import { loadPresenceUsers } from "@/lib/presence-store";

export type PublicUserProfile = SocialPerson & {
  slug: string;
  country: string;
  institution: string;
  field: string;
  bio: string;
  interests: string[];
  skills: string[];
  joinedRooms: string[];
  posts: number;
  comments: number;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  awards: string[];
  achievements: string[];
  bannerGradient: string;
};

export type ProfilePost = {
  id: string;
  title: string;
  room: string;
  excerpt: string;
  createdAt: string;
  replies: number;
  upvotes: number;
};

export type ProfileReply = {
  id: string;
  threadTitle: string;
  room: string;
  body: string;
  createdAt: string;
};

export type ProfileReputationEvent = {
  id: string;
  label: string;
  points: number;
  createdAt: string;
};

const now = Date.now();

const profileExtras: Record<string, Omit<PublicUserProfile, keyof SocialPerson | "slug">> = {
  ResearchNerd: {
    country: "Nigeria",
    institution: "CollegeDiscourse Research Network",
    field: "Research Methods",
    bio: "Helps students turn broad topics into focused, testable research questions.",
    interests: ["Research Design", "Academic Writing", "Literature Reviews"],
    skills: ["Problem Statements", "Methodology", "Feedback"],
    joinedRooms: ["Research Help", "Programming and AI"],
    posts: 24,
    comments: 168,
    joinedDate: "2025-09-12T10:00:00.000Z",
    followersCount: 842,
    followingCount: 91,
    awards: ["🏆", "⭐", "🎓"],
    achievements: ["Top Contributor", "Helpful Researcher", "Mentor"],
    bannerGradient: "from-blue-700 via-indigo-700 to-slate-900",
  },
  GradCoach: {
    country: "United Kingdom",
    institution: "Graduate Admissions Network",
    field: "PhD Admissions",
    bio: "Advises applicants on supervisor emails, statements of purpose, interviews, and funding strategy.",
    interests: ["PhD Admissions", "SOPs", "Funding"],
    skills: ["Supervisor Outreach", "Application Strategy", "Interview Prep"],
    joinedRooms: ["PhD Admissions", "Scholarships"],
    posts: 19,
    comments: 142,
    joinedDate: "2025-10-02T10:00:00.000Z",
    followersCount: 690,
    followingCount: 74,
    awards: ["🎓", "🏅", "⭐"],
    achievements: ["Admissions Mentor", "Verified Advisor", "Essay Helper"],
    bannerGradient: "from-purple-700 via-blue-700 to-slate-900",
  },
  MethodMentor: {
    country: "Ghana",
    institution: "Methods Lab",
    field: "Econometrics and Data Analysis",
    bio: "Answers questions on regression, panel data, causal inference, and empirical project design.",
    interests: ["Econometrics", "Panel Data", "Causal Inference"],
    skills: ["STATA", "R", "Research Design"],
    joinedRooms: ["Research Help", "Programming and AI"],
    posts: 31,
    comments: 211,
    joinedDate: "2025-08-19T10:00:00.000Z",
    followersCount: 934,
    followingCount: 116,
    awards: ["📊", "🏆", "⭐"],
    achievements: ["Methods Expert", "Top Answerer", "Data Mentor"],
    bannerGradient: "from-emerald-700 via-blue-700 to-slate-900",
  },
};

export function slugifyUser(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fallbackExtra(person: SocialPerson): Omit<PublicUserProfile, keyof SocialPerson | "slug"> {
  return {
    country: "Global",
    institution: "CollegeDiscourse",
    field: "Student Community",
    bio: "A CollegeDiscourse member participating in academic and career discussions.",
    interests: ["Education", "Community", "Mentorship"],
    skills: ["Discussion", "Peer Support"],
    joinedRooms: ["Research Help"],
    posts: 3,
    comments: 12,
    joinedDate: "2026-01-01T10:00:00.000Z",
    followersCount: 34 + person.reputation % 100,
    followingCount: 19,
    awards: ["✨"],
    achievements: ["Community Member"],
    bannerGradient: "from-blue-700 via-indigo-700 to-slate-900",
  };
}

export function loadPublicProfiles(): PublicUserProfile[] {
  const social = loadSocialStore();
  const people = [...social.followers, ...social.following].filter(
    (person, index, self) => index === self.findIndex((p) => p.id === person.id),
  );

  return people.map((person) => ({
    ...person,
    slug: slugifyUser(person.name),
    ...(profileExtras[person.name] ?? fallbackExtra(person)),
  }));
}

export function getPublicProfile(slug: string) {
  return loadPublicProfiles().find((profile) => profile.slug === slug);
}

export function getPublicProfilePresence(name: string) {
  return loadPresenceUsers().find((user) => user.name === name);
}

export function loadProfilePosts(profile: PublicUserProfile): ProfilePost[] {
  return [
    {
      id: `${profile.slug}-post-1`,
      title: `How I approach ${profile.field.toLowerCase()} questions`,
      room: profile.joinedRooms[0] ?? "Research Help",
      excerpt: `A practical note from ${profile.name} on how students can ask clearer questions and get better feedback.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      replies: 18,
      upvotes: 42,
    },
    {
      id: `${profile.slug}-post-2`,
      title: `Common mistakes students make in ${profile.interests[0] ?? "applications"}`,
      room: profile.joinedRooms[1] ?? profile.joinedRooms[0] ?? "Community",
      excerpt: "A short guide based on recurring discussions in CollegeDiscourse rooms.",
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
      replies: 11,
      upvotes: 29,
    },
  ];
}

export function loadProfileReplies(profile: PublicUserProfile): ProfileReply[] {
  return [
    {
      id: `${profile.slug}-reply-1`,
      threadTitle: "How do I make my research question testable?",
      room: "Research Help",
      body: `${profile.name} suggested narrowing the question to one outcome, one mechanism, and one measurable context.`,
      createdAt: new Date(now - 1000 * 60 * 48).toISOString(),
    },
    {
      id: `${profile.slug}-reply-2`,
      threadTitle: "Should I email a professor before applying?",
      room: "PhD Admissions",
      body: `${profile.name} advised sending a short, specific email tied to the professor's recent research.`,
      createdAt: new Date(now - 1000 * 60 * 60 * 31).toISOString(),
    },
  ];
}

export function loadProfileReputation(profile: PublicUserProfile): ProfileReputationEvent[] {
  return [
    { id: `${profile.slug}-rep-1`, label: "Helpful answer", points: 10, createdAt: new Date(now - 1000 * 60 * 60 * 4).toISOString() },
    { id: `${profile.slug}-rep-2`, label: "Resource shared", points: 15, createdAt: new Date(now - 1000 * 60 * 60 * 22).toISOString() },
    { id: `${profile.slug}-rep-3`, label: "Verified mentor contribution", points: 25, createdAt: new Date(now - 1000 * 60 * 60 * 54).toISOString() },
  ];
}

export function profileTimeAgo(input: string) {
  const date = new Date(input);
  if (!input || Number.isNaN(date.getTime())) return "recently";
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function joinedLabel(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Joined recently";
  return `Joined ${date.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;
}
