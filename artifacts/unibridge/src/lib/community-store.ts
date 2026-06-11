export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  members: number;
  color: string;
  rules: string[];
  tags: string[];
};

export type Post = {
  id: string;
  communitySlug: string;
  title: string;
  body: string;
  author: string;
  authorRole: string;
  tags: string[];
  votes: number;
  comments: number;
  createdAt: string;
  pinned?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  author: string;
  body: string;
  votes: number;
  createdAt: string;
  replies?: Comment[];
};

const STORAGE_KEY = "collegediscourse-community-v1";

const seedHubs: Community[] = [
  {
    id: "1",
    slug: "scholarships",
    name: "Scholarships",
    description: "Funding opportunities, essays, deadlines, and scholarship alerts for students everywhere.",
    members: 18420,
    color: "from-blue-600 to-blue-800",
    rules: ["No fake opportunities", "Mention country and deadline", "Be kind to applicants"],
    tags: ["Funding", "Deadlines", "Essays"],
  },
  {
    id: "2",
    slug: "study-abroad",
    name: "Study Abroad",
    description: "Admissions, visas, schools, costs, applications, and moving abroad as a student.",
    members: 26310,
    color: "from-blue-600 to-indigo-700",
    rules: ["Share country context", "No agent spam", "Use clear titles"],
    tags: ["Admissions", "Visa", "Housing"],
  },
  {
    id: "3",
    slug: "research-help",
    name: "Research Help",
    description: "Research questions, literature reviews, methods, data analysis, and academic writing support.",
    members: 15490,
    color: "from-emerald-600 to-teal-700",
    rules: ["Show your attempt", "No plagiarism", "Cite sources when possible"],
    tags: ["Methods", "Writing", "Data"],
  },
  {
    id: "4",
    slug: "phd-admissions",
    name: "PhD Admissions",
    description: "Statements of purpose, supervisors, funding, interviews, and graduate school strategy.",
    members: 9170,
    color: "from-blue-700 to-slate-900",
    rules: ["Protect private emails", "Be specific", "No profile shaming"],
    tags: ["SOP", "Funding", "Supervisors"],
  },
  {
    id: "5",
    slug: "career-launch",
    name: "Career Launch",
    description: "Internships, CVs, LinkedIn, interviews, networking, and early-career opportunities.",
    members: 12310,
    color: "from-red-600 to-blue-800",
    rules: ["No scam jobs", "Include location", "Be constructive"],
    tags: ["Internships", "CV", "Interview"],
  },
  {
    id: "6",
    slug: "college-applications",
    name: "College Applications",
    description: "Essays, recommendations, admissions deadlines, application strategy, and school selection.",
    members: 21150,
    color: "from-blue-700 to-cyan-700",
    rules: ["Do not share private documents", "Be respectful", "Use clear titles"],
    tags: ["Essays", "Admissions", "Deadlines"],
  },
  {
    id: "7",
    slug: "graduate-school",
    name: "Graduate School",
    description: "Master's programs, funding, exams, research fit, applications, and academic transitions.",
    members: 14380,
    color: "from-slate-800 to-blue-700",
    rules: ["Include degree level", "Mention country", "No misinformation"],
    tags: ["Masters", "Funding", "Programs"],
  },
  {
    id: "8",
    slug: "finance-economics",
    name: "Finance and Economics",
    description: "Finance, economics, econometrics, datasets, research ideas, and career pathways.",
    members: 10440,
    color: "from-blue-800 to-slate-950",
    rules: ["Show your method", "Cite data sources", "No low-effort spam"],
    tags: ["Finance", "Economics", "Econometrics"],
  },
  {
    id: "9",
    slug: "computer-science",
    name: "Computer Science",
    description: "Programming, AI, data science, software engineering, projects, internships, and debugging.",
    members: 16780,
    color: "from-cyan-700 to-blue-900",
    rules: ["Share error messages clearly", "No cheating requests", "Explain your attempt"],
    tags: ["Coding", "AI", "Software"],
  },
  {
    id: "10",
    slug: "ai-machine-learning",
    name: "AI and Machine Learning",
    description: "AI tools, ML projects, model training, research papers, prompts, and applications.",
    members: 13920,
    color: "from-blue-700 to-violet-800",
    rules: ["Respect academic integrity", "Explain datasets", "No unsafe automation"],
    tags: ["AI", "Machine Learning", "Projects"],
  },
  {
    id: "11",
    slug: "mentorship",
    name: "Mentorship",
    description: "Find mentors, ask for guidance, review academic plans, and support other students.",
    members: 7340,
    color: "from-teal-700 to-blue-800",
    rules: ["No paid exploitation", "Be respectful", "Protect personal details"],
    tags: ["Mentors", "Guidance", "Networking"],
  },
  {
    id: "12",
    slug: "international-students",
    name: "International Students",
    description: "Visa questions, housing, finances, culture shock, campus life, and transition support.",
    members: 19820,
    color: "from-blue-700 to-indigo-900",
    rules: ["Mention country", "No legal misinformation", "Share verified experience"],
    tags: ["Visa", "Housing", "Student Life"],
  },
  {
    id: "13",
    slug: "nigerian-students-abroad",
    name: "Nigerian Students Abroad",
    description: "Funding, visa, application, travel, and settlement advice for Nigerian students abroad.",
    members: 6920,
    color: "from-green-700 to-blue-800",
    rules: ["Be helpful", "No agent spam", "Share credible information"],
    tags: ["Nigeria", "Visa", "Funding"],
  },
  {
    id: "14",
    slug: "medicine-health",
    name: "Medicine and Health",
    description: "Medical school, public health, MCAT, nursing, residency, and health-career pathways.",
    members: 8460,
    color: "from-red-700 to-blue-800",
    rules: ["No medical diagnosis", "Use credible sources", "Be respectful"],
    tags: ["Medicine", "Public Health", "MCAT"],
  },
  {
    id: "15",
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    description: "Student startups, business ideas, grants, pitch decks, incubators, and entrepreneurship programs.",
    members: 6210,
    color: "from-blue-700 to-red-700",
    rules: ["No scams", "Be specific", "Share useful resources"],
    tags: ["Startups", "Business", "Grants"],
  },
];

const seedPosts: Post[] = [
  {
    id: "p1",
    communitySlug: "scholarships",
    title: "Fully funded scholarship thread: post opportunities with deadlines here",
    body: "Use this thread to share verified scholarships. Include eligibility, deadline, country, link, and whether it covers tuition, stipend, housing, or travel.",
    author: "ModTeam",
    authorRole: "Moderator",
    tags: ["Pinned", "Funding"],
    votes: 412,
    comments: 38,
    createdAt: "2026-06-08T08:00:00.000Z",
    pinned: true,
  },
  {
    id: "p2",
    communitySlug: "study-abroad",
    title: "How do I choose between Canada, Germany, and the UK for master's applications?",
    body: "I am comparing tuition, post-study work options, funding, and long-term career opportunities. What framework should I use before applying?",
    author: "AminaStudy",
    authorRole: "Applicant",
    tags: ["Masters", "Country Choice"],
    votes: 156,
    comments: 24,
    createdAt: "2026-06-08T10:30:00.000Z",
  },
  {
    id: "p3",
    communitySlug: "research-help",
    title: "What makes a research question strong enough for a serious paper?",
    body: "I know a good topic is not the same as a good research question. What criteria should students use to make sure their question is focused, testable, and original?",
    author: "ResearchNerd",
    authorRole: "Mentor",
    tags: ["Research Design", "Writing"],
    votes: 231,
    comments: 31,
    createdAt: "2026-06-08T12:15:00.000Z",
  },
  {
    id: "p4",
    communitySlug: "phd-admissions",
    title: "Should I email professors before applying? What should I say?",
    body: "Many applicants are unsure whether contacting supervisors helps or hurts. Please share strong email structures, what to avoid, and when not to email.",
    author: "GradCoach",
    authorRole: "Advisor",
    tags: ["Supervisors", "Email"],
    votes: 198,
    comments: 19,
    createdAt: "2026-06-07T16:00:00.000Z",
  },
  {
    id: "p5",
    communitySlug: "career-launch",
    title: "CV review checklist for students with little work experience",
    body: "If you lack formal experience, use projects, coursework, leadership, volunteering, and measurable outcomes. Drop your questions here.",
    author: "CareerBridge",
    authorRole: "Mentor",
    tags: ["CV", "Internships"],
    votes: 120,
    comments: 14,
    createdAt: "2026-06-07T19:45:00.000Z",
  },
];

const seedComments: Comment[] = [
  {
    id: "c1",
    postId: "p3",
    author: "MethodMentor",
    body: "A strong question usually has four things: a clear population, a measurable outcome, a comparison or mechanism, and a reason the answer matters.",
    votes: 47,
    createdAt: "2026-06-08T12:45:00.000Z",
    replies: [
      {
        id: "c1r1",
        postId: "p3",
        author: "ResearchNerd",
        body: "This is helpful. The mechanism point is what many students miss.",
        votes: 11,
        createdAt: "2026-06-08T13:00:00.000Z",
      },
    ],
  },
  {
    id: "c2",
    postId: "p2",
    author: "VisaGuide",
    body: "Start with your constraint: budget, program fit, work rights, and immigration timeline. The best country is usually the one where these four line up.",
    votes: 31,
    createdAt: "2026-06-08T11:10:00.000Z",
  },
];

export type Store = {
  communities: Community[];
  posts: Post[];
  comments: Comment[];
  saved: string[];
  joined: string[];
};

function mergeCommunities(savedCommunities?: Community[]) {
  const saved = savedCommunities ?? [];
  const savedBySlug = new Map(saved.map((community) => [community.slug, community]));
  return seedHubs.map((seed) => ({ ...seed, ...(savedBySlug.get(seed.slug) ?? {}) }));
}

export function loadStore(): Store {
  if (typeof window === "undefined") {
    return {
      communities: seedHubs,
      posts: seedPosts,
      comments: seedComments,
      saved: ["p3"],
      joined: ["research-help", "scholarships"],
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initial = {
      communities: seedHubs,
      posts: seedPosts,
      comments: seedComments,
      saved: ["p3"],
      joined: ["research-help", "scholarships"],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      communities: mergeCommunities(parsed.communities),
      posts: parsed.posts?.length ? parsed.posts : seedPosts,
      comments: parsed.comments?.length ? parsed.comments : seedComments,
      saved: parsed.saved ?? [],
      joined: parsed.joined ?? [],
    };
  } catch {
    return {
      communities: seedHubs,
      posts: seedPosts,
      comments: seedComments,
      saved: [],
      joined: [],
    };
  }
}

export function saveStore(store: Store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("unibridge-store-updated"));
}

export function toggleJoinedInStore(slug: string) {
  const current = loadStore();
  const isJoined = current.joined.includes(slug);
  const joined = isJoined ? current.joined.filter((item) => item !== slug) : [...current.joined, slug];
  const communities = current.communities.map((community) =>
    community.slug === slug
      ? { ...community, members: Math.max(0, community.members + (isJoined ? -1 : 1)) }
      : community,
  );
  const next = { ...current, joined, communities };
  saveStore(next);
  return next;
}

export function timeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
