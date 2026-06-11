import { Router, type IRouter } from "express";

const router: IRouter = Router();

type SubBridge = {
  id: number;
  slug: string;
  name: string;
  description: string;
  members: number;
  category: string;
  color: string;
  rules: string[];
  tags: string[];
  joined?: boolean;
};

type SubBridgePost = {
  id: string;
  subbridgeSlug: string;
  title: string;
  body: string;
  author: string;
  authorRole: string;
  tags: string[];
  votes: number;
  comments: number;
  createdAt: string;
  pinned?: boolean;
  saved?: boolean;
};

type SubBridgeComment = {
  id: string;
  postId: string;
  author: string;
  body: string;
  votes: number;
  createdAt: string;
  parentId?: string | null;
};

type Report = {
  id: string;
  targetType: "post" | "comment" | "subbridge";
  targetId: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
};

const joined = new Set<string>(["scholarships", "research-help"]);
const savedPosts = new Set<string>(["sbp-3"]);

const subbridges: SubBridge[] = [
  { id: 1, slug: "scholarships", name: "Scholarships", description: "Funding opportunities, essays, deadlines, and scholarship alerts for students everywhere.", members: 18420, category: "Funding", color: "from-amber-500 to-orange-500", rules: ["No fake opportunities", "Mention country and deadline", "Be kind to applicants"], tags: ["Funding", "Deadlines", "Essays"] },
  { id: 2, slug: "study-abroad", name: "Study Abroad", description: "Admissions, visas, schools, costs, applications, and moving abroad as a student.", members: 26310, category: "Admissions", color: "from-blue-500 to-indigo-500", rules: ["Share country context", "No agent spam", "Use clear titles"], tags: ["Admissions", "Visa", "Housing"] },
  { id: 3, slug: "research-help", name: "Research Help", description: "Research questions, literature reviews, methods, data analysis, and academic writing support.", members: 15490, category: "Research", color: "from-emerald-500 to-teal-500", rules: ["Show your attempt", "No plagiarism", "Cite sources when possible"], tags: ["Methods", "Writing", "Data"] },
  { id: 4, slug: "phd-admissions", name: "PhD Admissions", description: "Statements of purpose, supervisors, funding, interviews, and graduate school strategy.", members: 9170, category: "Graduate School", color: "from-purple-500 to-fuchsia-500", rules: ["Protect private emails", "Be specific", "No profile shaming"], tags: ["SOP", "Funding", "Supervisors"] },
  { id: 5, slug: "career-launch", name: "Career Launch", description: "Internships, CVs, LinkedIn, interviews, networking, and early-career opportunities.", members: 12310, category: "Careers", color: "from-rose-500 to-pink-500", rules: ["No scam jobs", "Include location", "Be constructive"], tags: ["Internships", "CV", "Interview"] },
  { id: 6, slug: "ai-machine-learning", name: "AI and Machine Learning", description: "Python, AI tools, machine learning, data science, projects, and technical interview preparation.", members: 11100, category: "Technology", color: "from-cyan-500 to-blue-500", rules: ["Share reproducible context", "No academic dishonesty", "Explain your code or error"], tags: ["AI", "Python", "Data"] },
  { id: 7, slug: "finance-economics", name: "Finance and Economics", description: "Economics, finance, econometrics, markets, research topics, and career paths.", members: 8600, category: "Business", color: "from-slate-700 to-slate-950", rules: ["No financial scams", "Separate opinion from evidence", "Use sources for claims"], tags: ["Finance", "Economics", "Markets"] },
  { id: 8, slug: "nigerian-students-abroad", name: "Nigerian Students Abroad", description: "Scholarships, admissions, visa issues, travel preparation, funding, and community support.", members: 7400, category: "International Students", color: "from-green-500 to-emerald-700", rules: ["No agent spam", "Be respectful", "Verify opportunities before posting"], tags: ["Nigeria", "Visa", "Funding"] },
  { id: 9, slug: "college-applications", name: "College Applications", description: "Essays, recommendation letters, admissions lists, timelines, and application strategy.", members: 9900, category: "Admissions", color: "from-indigo-500 to-violet-600", rules: ["Do not share private documents", "Give constructive feedback", "Mention school/country context"], tags: ["Essays", "Deadlines", "Admissions"] },
  { id: 10, slug: "international-students", name: "International Students", description: "Cross-border admissions, funding, housing, culture shock, immigration, and peer support.", members: 13200, category: "International Students", color: "from-sky-500 to-cyan-600", rules: ["Be respectful across countries", "Avoid misinformation", "Use official links"], tags: ["Visa", "Housing", "Culture"] },
];

const posts: SubBridgePost[] = [
  { id: "sbp-1", subbridgeSlug: "scholarships", title: "Verified fully funded scholarships thread", body: "Post verified opportunities with eligibility, country, deadline, benefits, and official link.", author: "ModTeam", authorRole: "Moderator", tags: ["Pinned", "Funding"], votes: 412, comments: 2, createdAt: "2026-06-08T08:00:00.000Z", pinned: true },
  { id: "sbp-2", subbridgeSlug: "study-abroad", title: "Choosing between Canada, Germany, and the UK for master’s study", body: "Compare tuition, work rights, funding, immigration timeline, and program fit before deciding.", author: "AminaStudy", authorRole: "Applicant", tags: ["Masters", "Country Choice"], votes: 156, comments: 1, createdAt: "2026-06-08T10:30:00.000Z" },
  { id: "sbp-3", subbridgeSlug: "research-help", title: "What makes a research question strong enough for a serious paper?", body: "A good research question is focused, testable, grounded in literature, and connected to a clear mechanism.", author: "ResearchNerd", authorRole: "Mentor", tags: ["Research Design", "Writing"], votes: 231, comments: 1, createdAt: "2026-06-08T12:15:00.000Z" },
  { id: "sbp-4", subbridgeSlug: "phd-admissions", title: "Should applicants email professors before applying?", body: "Email only when there is a real research fit. Keep it short, specific, and professional.", author: "GradCoach", authorRole: "Advisor", tags: ["Supervisors", "Email"], votes: 198, comments: 0, createdAt: "2026-06-07T16:00:00.000Z" },
  { id: "sbp-5", subbridgeSlug: "career-launch", title: "CV review checklist for students with little work experience", body: "Use projects, coursework, leadership, volunteering, and measurable outcomes to show capability.", author: "CareerBridge", authorRole: "Mentor", tags: ["CV", "Internships"], votes: 120, comments: 0, createdAt: "2026-06-07T19:45:00.000Z" },
];

const comments: SubBridgeComment[] = [
  { id: "sbc-1", postId: "sbp-3", author: "MethodMentor", body: "A strong question usually has a clear population, measurable outcome, mechanism, and contribution.", votes: 47, createdAt: "2026-06-08T12:45:00.000Z" },
  { id: "sbc-2", postId: "sbp-2", author: "VisaGuide", body: "Start with budget, work rights, funding probability, and immigration timeline.", votes: 31, createdAt: "2026-06-08T11:10:00.000Z" },
  { id: "sbc-3", postId: "sbp-1", author: "ScholarshipScout", body: "Please add country tags and official URLs. It makes verification much easier.", votes: 22, createdAt: "2026-06-08T09:10:00.000Z" },
  { id: "sbc-4", postId: "sbp-1", author: "GradApplicant", body: "Can we separate bachelor, master’s, and PhD opportunities in the pinned thread?", votes: 14, createdAt: "2026-06-08T09:35:00.000Z" },
];

const reports: Report[] = [
  { id: "rep-1", targetType: "post", targetId: "sbp-1", reason: "Moderator review queue sample", status: "open", createdAt: new Date().toISOString() },
];

function attachState(subbridge: SubBridge): SubBridge {
  return { ...subbridge, joined: joined.has(subbridge.slug) };
}

function attachPostState(post: SubBridgePost): SubBridgePost {
  const commentCount = comments.filter((comment) => comment.postId === post.id).length;
  return { ...post, comments: commentCount, saved: savedPosts.has(post.id) };
}

function getSortedFeed(items = posts): SubBridgePost[] {
  return [...items].map(attachPostState).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.votes - a.votes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

router.get("/subbridges", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const category = typeof req.query.category === "string" ? req.query.category.toLowerCase() : "";
  const filtered = subbridges.filter((subbridge) => {
    const matchesSearch = !search || [subbridge.slug, subbridge.name, subbridge.description, ...subbridge.tags].join(" ").toLowerCase().includes(search);
    const matchesCategory = !category || subbridge.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });
  res.json(filtered.map(attachState));
});

router.get("/communities", (_req, res) => res.json(subbridges.map(attachState)));

router.post("/subbridges", (req, res) => {
  const { slug, name, description, category = "General", tags = [] } = req.body ?? {};
  if (!slug || !name || !description) {
    res.status(400).json({ error: "slug, name, and description are required" });
    return;
  }
  const normalizedSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (subbridges.some((subbridge) => subbridge.slug === normalizedSlug)) {
    res.status(409).json({ error: "SubBridge already exists" });
    return;
  }
  const subbridge: SubBridge = {
    id: subbridges.length + 1,
    slug: normalizedSlug,
    name: String(name),
    description: String(description),
    members: 1,
    category: String(category),
    color: "from-orange-500 to-red-500",
    rules: ["Be respectful", "Stay on topic", "No spam"],
    tags: Array.isArray(tags) ? tags.map(String) : [],
  };
  subbridges.push(subbridge);
  joined.add(subbridge.slug);
  res.status(201).json(attachState(subbridge));
});

router.get("/subbridges/:slug", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubBridge not found" });
    return;
  }
  res.json(attachState(subbridge));
});

router.get("/communities/:slug", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "Community not found" });
    return;
  }
  res.json(attachState(subbridge));
});

router.get("/subbridges/:slug/posts", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubBridge not found" });
    return;
  }
  res.json(getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
});

router.post("/subbridges/:slug/posts", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubBridge not found" });
    return;
  }
  const { title, body, tags = [], author = "You", authorRole = "Member" } = req.body ?? {};
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }
  const post: SubBridgePost = {
    id: `sbp-${Date.now()}`,
    subbridgeSlug: subbridge.slug,
    title: String(title).trim(),
    body: String(body).trim(),
    author: String(author),
    authorRole: String(authorRole),
    tags: Array.isArray(tags) ? tags.map(String).slice(0, 5) : [],
    votes: 1,
    comments: 0,
    createdAt: new Date().toISOString(),
  };
  posts.unshift(post);
  res.status(201).json(attachPostState(post));
});

router.get("/communities/:slug/posts", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "Community not found" });
    return;
  }
  res.json(getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
});

router.post("/subbridges/:slug/join", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubBridge not found" });
    return;
  }
  if (!joined.has(subbridge.slug)) {
    joined.add(subbridge.slug);
    subbridge.members += 1;
  }
  res.json({ joined: true, subbridge: attachState(subbridge) });
});

router.delete("/subbridges/:slug/leave", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubBridge not found" });
    return;
  }
  if (joined.has(subbridge.slug)) {
    joined.delete(subbridge.slug);
    subbridge.members = Math.max(0, subbridge.members - 1);
  }
  res.json({ joined: false, subbridge: attachState(subbridge) });
});

router.get("/feed", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const subbridge = typeof req.query.subbridge === "string" ? req.query.subbridge : "";
  let filtered = posts;
  if (subbridge) filtered = filtered.filter((post) => post.subbridgeSlug === subbridge);
  if (search) {
    filtered = filtered.filter((post) => [post.title, post.body, post.author, post.subbridgeSlug, ...post.tags].join(" ").toLowerCase().includes(search));
  }
  res.json(getSortedFeed(filtered));
});

router.get("/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const matchedSubbridges = subbridges.filter((item) => [item.slug, item.name, item.description, ...item.tags].join(" ").toLowerCase().includes(q)).map(attachState);
  const matchedPosts = getSortedFeed(posts.filter((post) => [post.title, post.body, post.author, post.subbridgeSlug, ...post.tags].join(" ").toLowerCase().includes(q)));
  res.json({ subbridges: matchedSubbridges, posts: matchedPosts });
});

router.post("/subbridge-posts/:id/upvote", (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  post.votes += 1;
  res.json(attachPostState(post));
});

router.post("/subbridge-posts/:id/downvote", (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  post.votes = Math.max(0, post.votes - 1);
  res.json(attachPostState(post));
});

router.post("/subbridge-posts/:id/save", (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (savedPosts.has(post.id)) savedPosts.delete(post.id);
  else savedPosts.add(post.id);
  res.json(attachPostState(post));
});

router.get("/subbridge-posts/:id/comments", (req, res) => {
  res.json(comments.filter((comment) => comment.postId === req.params.id).sort((a, b) => b.votes - a.votes));
});

router.post("/subbridge-posts/:id/comments", (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const { body, author = "You", parentId = null } = req.body ?? {};
  if (!body) {
    res.status(400).json({ error: "body is required" });
    return;
  }
  const comment: SubBridgeComment = { id: `sbc-${Date.now()}`, postId: post.id, author: String(author), body: String(body), votes: 0, createdAt: new Date().toISOString(), parentId };
  comments.unshift(comment);
  post.comments = comments.filter((item) => item.postId === post.id).length;
  res.status(201).json(comment);
});

router.post("/reports", (req, res) => {
  const { targetType = "post", targetId, reason = "Community report" } = req.body ?? {};
  if (!targetId) {
    res.status(400).json({ error: "targetId is required" });
    return;
  }
  const report: Report = { id: `rep-${Date.now()}`, targetType, targetId: String(targetId), reason: String(reason), status: "open", createdAt: new Date().toISOString() };
  reports.unshift(report);
  res.status(201).json(report);
});

router.get("/moderation/queue", (_req, res) => {
  res.json(reports);
});

router.patch("/moderation/reports/:id/resolve", (req, res) => {
  const report = reports.find((item) => item.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  report.status = "resolved";
  res.json(report);
});

router.get("/saved-posts", (_req, res) => {
  res.json(getSortedFeed(posts.filter((post) => savedPosts.has(post.id))));
});

router.get("/reputation/leaderboard", (_req, res) => {
  const authors = new Map<string, { user: string; points: number; posts: number; comments: number }>();
  posts.forEach((post) => {
    const current = authors.get(post.author) ?? { user: post.author, points: 0, posts: 0, comments: 0 };
    current.points += post.votes * 2 + post.comments;
    current.posts += 1;
    authors.set(post.author, current);
  });
  comments.forEach((comment) => {
    const current = authors.get(comment.author) ?? { user: comment.author, points: 0, posts: 0, comments: 0 };
    current.points += comment.votes;
    current.comments += 1;
    authors.set(comment.author, current);
  });
  res.json([...authors.values()].sort((a, b) => b.points - a.points).slice(0, 10));
});

router.get("/messages/channels", (_req, res) => {
  res.json([
    { id: "general", name: "General Study Lounge", unread: 3, lastMessage: "Welcome to the SubBridge community." },
    { id: "scholarships", name: "Scholarship Alerts", unread: 6, lastMessage: "New funding thread is live." },
    { id: "mentors", name: "Mentor Office Hours", unread: 1, lastMessage: "Drop questions before Friday." },
  ]);
});

export default router;
