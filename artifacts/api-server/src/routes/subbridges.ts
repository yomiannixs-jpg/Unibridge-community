import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

type SubDiscourse = {
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

type SubDiscoursePost = {
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

type SubDiscourseComment = {
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

const subbridges: SubDiscourse[] = [
  { id: 1, slug: "scholarships", name: "Scholarships", description: "Funding opportunities, essays, deadlines, and scholarship alerts for students everywhere.", members: 18420, category: "Funding", color: "from-blue-600 to-blue-800", rules: ["No fake opportunities", "Mention country and deadline", "Be kind to applicants"], tags: ["Funding", "Deadlines", "Essays"] },
  { id: 2, slug: "study-abroad", name: "Study Abroad", description: "Admissions, visas, schools, costs, applications, and moving abroad as a student.", members: 26310, category: "Admissions", color: "from-blue-600 to-indigo-700", rules: ["Share country context", "No agent spam", "Use clear titles"], tags: ["Admissions", "Visa", "Housing"] },
  { id: 3, slug: "research-help", name: "Research Help", description: "Research questions, literature reviews, methods, data analysis, and academic writing support.", members: 15490, category: "Research", color: "from-emerald-600 to-teal-700", rules: ["Show your attempt", "No plagiarism", "Cite sources when possible"], tags: ["Methods", "Writing", "Data"] },
  { id: 4, slug: "phd-admissions", name: "PhD Admissions", description: "Statements of purpose, supervisors, funding, interviews, and graduate school strategy.", members: 9170, category: "Graduate School", color: "from-blue-700 to-slate-900", rules: ["Protect private emails", "Be specific", "No profile shaming"], tags: ["SOP", "Funding", "Supervisors"] },
  { id: 5, slug: "career-launch", name: "Career Launch", description: "Internships, CVs, LinkedIn, interviews, networking, and early-career opportunities.", members: 12310, category: "Careers", color: "from-red-600 to-blue-800", rules: ["No scam jobs", "Include location", "Be constructive"], tags: ["Internships", "CV", "Interview"] },
  { id: 6, slug: "college-applications", name: "College Applications", description: "Essays, recommendations, admissions deadlines, application strategy, and school selection.", members: 21150, category: "Admissions", color: "from-blue-700 to-cyan-700", rules: ["Do not share private documents", "Be respectful", "Use clear titles"], tags: ["Essays", "Admissions", "Deadlines"] },
  { id: 7, slug: "graduate-school", name: "Graduate School", description: "Master's programs, funding, exams, research fit, applications, and academic transitions.", members: 14380, category: "Graduate School", color: "from-slate-800 to-blue-700", rules: ["Include degree level", "Mention country", "No misinformation"], tags: ["Masters", "Funding", "Programs"] },
  { id: 8, slug: "finance-economics", name: "Finance and Economics", description: "Finance, economics, econometrics, datasets, research ideas, and career pathways.", members: 10440, category: "Business", color: "from-blue-800 to-slate-950", rules: ["Show your method", "Cite data sources", "No low-effort spam"], tags: ["Finance", "Economics", "Econometrics"] },
  { id: 9, slug: "computer-science", name: "Computer Science", description: "Programming, AI, data science, software engineering, projects, internships, and debugging.", members: 16780, category: "Technology", color: "from-cyan-700 to-blue-900", rules: ["Share error messages clearly", "No cheating requests", "Explain your attempt"], tags: ["Coding", "AI", "Software"] },
  { id: 10, slug: "ai-machine-learning", name: "AI and Machine Learning", description: "AI tools, ML projects, model training, research papers, prompts, and applications.", members: 13920, category: "Technology", color: "from-blue-700 to-violet-800", rules: ["Respect academic integrity", "Explain datasets", "No unsafe automation"], tags: ["AI", "Machine Learning", "Projects"] },
  { id: 11, slug: "mentorship", name: "Mentorship", description: "Find mentors, ask for guidance, review academic plans, and support other students.", members: 7340, category: "Support", color: "from-teal-700 to-blue-800", rules: ["No paid exploitation", "Be respectful", "Protect personal details"], tags: ["Mentors", "Guidance", "Networking"] },
  { id: 12, slug: "international-students", name: "International Students", description: "Visa questions, housing, finances, culture shock, campus life, and transition support.", members: 19820, category: "International Students", color: "from-blue-700 to-indigo-900", rules: ["Mention country", "No legal misinformation", "Share verified experience"], tags: ["Visa", "Housing", "Student Life"] },
  { id: 13, slug: "nigerian-students-abroad", name: "Nigerian Students Abroad", description: "Funding, visa, application, travel, and settlement advice for Nigerian students abroad.", members: 6920, category: "International Students", color: "from-green-700 to-blue-800", rules: ["Be helpful", "No agent spam", "Share credible information"], tags: ["Nigeria", "Visa", "Funding"] },
  { id: 14, slug: "medicine-health", name: "Medicine and Health", description: "Medical school, public health, MCAT, nursing, residency, and health-career pathways.", members: 8460, category: "Health", color: "from-red-700 to-blue-800", rules: ["No medical diagnosis", "Use credible sources", "Be respectful"], tags: ["Medicine", "Public Health", "MCAT"] },
  { id: 15, slug: "entrepreneurship", name: "Entrepreneurship", description: "Student startups, business ideas, grants, pitch decks, incubators, and entrepreneurship programs.", members: 6210, category: "Business", color: "from-blue-700 to-red-700", rules: ["No scams", "Be specific", "Share useful resources"], tags: ["Startups", "Business", "Grants"] },
];

const posts: SubDiscoursePost[] = [
  { id: "sbp-1", subbridgeSlug: "scholarships", title: "Verified fully funded scholarships thread", body: "Post verified opportunities with eligibility, country, deadline, benefits, and official link.", author: "ModTeam", authorRole: "Moderator", tags: ["Pinned", "Funding"], votes: 412, comments: 2, createdAt: "2026-06-08T08:00:00.000Z", pinned: true },
  { id: "sbp-2", subbridgeSlug: "study-abroad", title: "Choosing between Canada, Germany, and the UK for master’s study", body: "Compare tuition, work rights, funding, immigration timeline, and program fit before deciding.", author: "AminaStudy", authorRole: "Applicant", tags: ["Masters", "Country Choice"], votes: 156, comments: 1, createdAt: "2026-06-08T10:30:00.000Z" },
  { id: "sbp-3", subbridgeSlug: "research-help", title: "What makes a research question strong enough for a serious paper?", body: "A good research question is focused, testable, grounded in literature, and connected to a clear mechanism.", author: "ResearchNerd", authorRole: "Mentor", tags: ["Research Design", "Writing"], votes: 231, comments: 1, createdAt: "2026-06-08T12:15:00.000Z" },
  { id: "sbp-4", subbridgeSlug: "phd-admissions", title: "Should applicants email professors before applying?", body: "Email only when there is a real research fit. Keep it short, specific, and professional.", author: "GradCoach", authorRole: "Advisor", tags: ["Supervisors", "Email"], votes: 198, comments: 0, createdAt: "2026-06-07T16:00:00.000Z" },
  { id: "sbp-5", subbridgeSlug: "career-launch", title: "CV review checklist for students with little work experience", body: "Use projects, coursework, leadership, volunteering, and measurable outcomes to show capability.", author: "CareerBridge", authorRole: "Mentor", tags: ["CV", "Internships"], votes: 120, comments: 0, createdAt: "2026-06-07T19:45:00.000Z" },
];

const comments: SubDiscourseComment[] = [
  { id: "sbc-1", postId: "sbp-3", author: "MethodMentor", body: "A strong question usually has a clear population, measurable outcome, mechanism, and contribution.", votes: 47, createdAt: "2026-06-08T12:45:00.000Z" },
  { id: "sbc-2", postId: "sbp-2", author: "VisaGuide", body: "Start with budget, work rights, funding probability, and immigration timeline.", votes: 31, createdAt: "2026-06-08T11:10:00.000Z" },
  { id: "sbc-3", postId: "sbp-1", author: "ScholarshipScout", body: "Please add country tags and official URLs. It makes verification much easier.", votes: 22, createdAt: "2026-06-08T09:10:00.000Z" },
  { id: "sbc-4", postId: "sbp-1", author: "GradApplicant", body: "Can we separate bachelor, master’s, and PhD opportunities in the pinned thread?", votes: 14, createdAt: "2026-06-08T09:35:00.000Z" },
];

const reports: Report[] = [
  { id: "rep-1", targetType: "post", targetId: "sbp-1", reason: "Moderator review queue sample", status: "open", createdAt: new Date().toISOString() },
];

let databaseReady = false;
let databaseChecked = false;

async function ensureCommunityTables(): Promise<boolean> {
  if (databaseChecked) return databaseReady;
  databaseChecked = true;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cd_posts (
        id TEXT PRIMARY KEY,
        subbridge_slug TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Guest',
        author_role TEXT NOT NULL DEFAULT 'Member',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        votes INTEGER NOT NULL DEFAULT 1,
        pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cd_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES cd_posts(id) ON DELETE CASCADE,
        author TEXT NOT NULL DEFAULT 'Guest',
        body TEXT NOT NULL,
        votes INTEGER NOT NULL DEFAULT 0,
        parent_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    databaseReady = true;
  } catch (error) {
    console.error("CollegeDiscourse database persistence is unavailable; using in-memory fallback.", error);
    databaseReady = false;
  }
  return databaseReady;
}

function toTags(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function rowToPost(row: Record<string, unknown>, commentCount = 0): SubDiscoursePost {
  return {
    id: String(row.id),
    subbridgeSlug: String(row.subbridge_slug),
    title: String(row.title),
    body: String(row.body),
    author: String(row.author ?? "Guest"),
    authorRole: String(row.author_role ?? "Member"),
    tags: toTags(row.tags),
    votes: Number(row.votes ?? 0),
    comments: commentCount,
    createdAt: new Date(String(row.created_at)).toISOString(),
    pinned: Boolean(row.pinned),
    saved: savedPosts.has(String(row.id)),
  };
}

function rowToComment(row: Record<string, unknown>): SubDiscourseComment {
  return {
    id: String(row.id),
    postId: String(row.post_id),
    author: String(row.author ?? "Guest"),
    body: String(row.body),
    votes: Number(row.votes ?? 0),
    createdAt: new Date(String(row.created_at)).toISOString(),
    parentId: row.parent_id ? String(row.parent_id) : null,
  };
}

async function dbPosts(whereClause = "", values: unknown[] = []): Promise<SubDiscoursePost[] | null> {
  if (!(await ensureCommunityTables())) return null;
  const result = await pool.query(
    `SELECT p.*, COALESCE(c.count, 0)::int AS comment_count
     FROM cd_posts p
     LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM cd_comments GROUP BY post_id) c ON c.post_id = p.id
     ${whereClause}
     ORDER BY pinned DESC, votes DESC, created_at DESC`,
    values,
  );
  return result.rows.map((row) => rowToPost(row, Number(row.comment_count ?? 0)));
}

async function dbInsertPost(input: Omit<SubDiscoursePost, "comments" | "saved">): Promise<SubDiscoursePost | null> {
  if (!(await ensureCommunityTables())) return null;
  const result = await pool.query(
    `INSERT INTO cd_posts (id, subbridge_slug, title, body, author, author_role, tags, votes, pinned, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
     RETURNING *`,
    [input.id, input.subbridgeSlug, input.title, input.body, input.author, input.authorRole, JSON.stringify(input.tags), input.votes, Boolean(input.pinned), input.createdAt],
  );
  return rowToPost(result.rows[0] as Record<string, unknown>, 0);
}

async function dbUpvote(postId: string, delta: 1 | -1): Promise<SubDiscoursePost | null> {
  if (!(await ensureCommunityTables())) return null;
  const result = await pool.query(
    `UPDATE cd_posts SET votes = GREATEST(0, votes + $2) WHERE id = $1 RETURNING *`,
    [postId, delta],
  );
  if (!result.rows[0]) return null;
  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM cd_comments WHERE post_id = $1`, [postId]);
  return rowToPost(result.rows[0] as Record<string, unknown>, Number(count.rows[0]?.count ?? 0));
}

async function dbComments(postId: string): Promise<SubDiscourseComment[] | null> {
  if (!(await ensureCommunityTables())) return null;
  const result = await pool.query(
    `SELECT * FROM cd_comments WHERE post_id = $1 ORDER BY votes DESC, created_at DESC`,
    [postId],
  );
  return result.rows.map((row) => rowToComment(row));
}

async function dbInsertComment(input: SubDiscourseComment): Promise<SubDiscourseComment | null> {
  if (!(await ensureCommunityTables())) return null;
  const result = await pool.query(
    `INSERT INTO cd_comments (id, post_id, author, body, votes, parent_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [input.id, input.postId, input.author, input.body, input.votes, input.parentId ?? null, input.createdAt],
  );
  return rowToComment(result.rows[0] as Record<string, unknown>);
}

async function seedDatabaseIfEmpty() {
  if (!(await ensureCommunityTables())) return;
  const count = await pool.query(`SELECT COUNT(*)::int AS count FROM cd_posts`);
  if (Number(count.rows[0]?.count ?? 0) > 0) return;
  for (const post of posts) {
    await dbInsertPost(post);
  }
  for (const comment of comments) {
    await dbInsertComment(comment);
  }
}

void seedDatabaseIfEmpty().catch((error) => console.error("CollegeDiscourse seed failed", error));

function attachState(subbridge: SubDiscourse): SubDiscourse {
  return { ...subbridge, joined: joined.has(subbridge.slug) };
}

function attachPostState(post: SubDiscoursePost): SubDiscoursePost {
  const commentCount = comments.filter((comment) => comment.postId === post.id).length;
  return { ...post, comments: commentCount, saved: savedPosts.has(post.id) };
}

function getSortedFeed(items = posts): SubDiscoursePost[] {
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
    res.status(409).json({ error: "SubDiscourse already exists" });
    return;
  }
  const subbridge: SubDiscourse = {
    id: subbridges.length + 1,
    slug: normalizedSlug,
    name: String(name),
    description: String(description),
    members: 1,
    category: String(category),
    color: "from-blue-700 to-red-700",
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
    res.status(404).json({ error: "SubDiscourse not found" });
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

router.get("/subbridges/:slug/posts", async (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubDiscourse not found" });
    return;
  }
  try {
    const persisted = await dbPosts(`WHERE subbridge_slug = $1`, [req.params.slug]);
    res.json(persisted ?? getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
  } catch {
    res.json(getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
  }
});

router.post("/subbridges/:slug/posts", async (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubDiscourse not found" });
    return;
  }
  const { title, body, tags = [], author = "Guest", authorRole = "Member" } = req.body ?? {};
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }
  const post: SubDiscoursePost = {
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
  try {
    const persisted = await dbInsertPost(post);
    res.status(201).json(persisted ?? attachPostState(post));
  } catch {
    res.status(201).json(attachPostState(post));
  }
});

router.get("/communities/:slug/posts", async (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "Community not found" });
    return;
  }
  try {
    const persisted = await dbPosts(`WHERE subbridge_slug = $1`, [req.params.slug]);
    res.json(persisted ?? getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
  } catch {
    res.json(getSortedFeed(posts.filter((post) => post.subbridgeSlug === req.params.slug)));
  }
});

router.post("/subbridges/:slug/join", (req, res) => {
  const subbridge = subbridges.find((item) => item.slug === req.params.slug);
  if (!subbridge) {
    res.status(404).json({ error: "SubDiscourse not found" });
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
    res.status(404).json({ error: "SubDiscourse not found" });
    return;
  }
  if (joined.has(subbridge.slug)) {
    joined.delete(subbridge.slug);
    subbridge.members = Math.max(0, subbridge.members - 1);
  }
  res.json({ joined: false, subbridge: attachState(subbridge) });
});

router.get("/feed", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const subbridge = typeof req.query.subbridge === "string" ? req.query.subbridge : "";
  try {
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (subbridge) {
      values.push(subbridge);
      clauses.push(`subbridge_slug = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      clauses.push(`LOWER(title || ' ' || body || ' ' || author || ' ' || subbridge_slug) LIKE $${values.length}`);
    }
    const persisted = await dbPosts(clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", values);
    if (persisted) {
      res.json(persisted);
      return;
    }
  } catch {
    // fall back to in-memory seed data below
  }
  let filtered = posts;
  if (subbridge) filtered = filtered.filter((post) => post.subbridgeSlug === subbridge);
  if (search) {
    filtered = filtered.filter((post) => [post.title, post.body, post.author, post.subbridgeSlug, ...post.tags].join(" ").toLowerCase().includes(search));
  }
  res.json(getSortedFeed(filtered));
});

router.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const matchedSubbridges = subbridges.filter((item) => [item.slug, item.name, item.description, ...item.tags].join(" ").toLowerCase().includes(q)).map(attachState);
  try {
    const matchedPosts = await dbPosts(q ? `WHERE LOWER(title || ' ' || body || ' ' || author || ' ' || subbridge_slug) LIKE $1` : "", q ? [`%${q}%`] : []);
    res.json({ subbridges: matchedSubbridges, posts: matchedPosts ?? getSortedFeed(posts) });
  } catch {
    const matchedPosts = getSortedFeed(posts.filter((post) => [post.title, post.body, post.author, post.subbridgeSlug, ...post.tags].join(" ").toLowerCase().includes(q)));
    res.json({ subbridges: matchedSubbridges, posts: matchedPosts });
  }
});

router.post("/subbridge-posts/:id/upvote", async (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (post) post.votes += 1;
  try {
    const persisted = await dbUpvote(req.params.id, 1);
    if (persisted) {
      res.json(persisted);
      return;
    }
  } catch {
    // fall back to in-memory post below
  }
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(attachPostState(post));
});

router.post("/subbridge-posts/:id/downvote", async (req, res) => {
  const post = posts.find((item) => item.id === req.params.id);
  if (post) post.votes = Math.max(0, post.votes - 1);
  try {
    const persisted = await dbUpvote(req.params.id, -1);
    if (persisted) {
      res.json(persisted);
      return;
    }
  } catch {
    // fall back to in-memory post below
  }
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
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

router.get("/subbridge-posts/:id/comments", async (req, res) => {
  try {
    const persisted = await dbComments(req.params.id);
    res.json(persisted ?? comments.filter((comment) => comment.postId === req.params.id).sort((a, b) => b.votes - a.votes));
  } catch {
    res.json(comments.filter((comment) => comment.postId === req.params.id).sort((a, b) => b.votes - a.votes));
  }
});

router.post("/subbridge-posts/:id/comments", async (req, res) => {
  const { body, author = "You", parentId = null } = req.body ?? {};
  if (!body) {
    res.status(400).json({ error: "body is required" });
    return;
  }
  const post = posts.find((item) => item.id === req.params.id);
  const comment: SubDiscourseComment = { id: `sbc-${Date.now()}`, postId: req.params.id, author: String(author), body: String(body), votes: 0, createdAt: new Date().toISOString(), parentId };
  comments.unshift(comment);
  if (post) post.comments = comments.filter((item) => item.postId === post.id).length;
  try {
    const persisted = await dbInsertComment(comment);
    res.status(201).json(persisted ?? comment);
  } catch {
    res.status(201).json(comment);
  }
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

router.get("/saved-posts", async (_req, res) => {
  try {
    const persisted = await dbPosts(savedPosts.size ? `WHERE id = ANY($1::text[])` : "WHERE FALSE", [[...savedPosts]]);
    res.json(persisted ?? getSortedFeed(posts.filter((post) => savedPosts.has(post.id))));
  } catch {
    res.json(getSortedFeed(posts.filter((post) => savedPosts.has(post.id))));
  }
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
    { id: "general", name: "General Study Lounge", unread: 3, lastMessage: "Welcome to the SubDiscourse community." },
    { id: "scholarships", name: "Scholarship Alerts", unread: 6, lastMessage: "New funding thread is live." },
    { id: "mentors", name: "Mentor Office Hours", unread: 1, lastMessage: "Drop questions before Friday." },
  ]);
});

export default router;
