export type DemoComment = {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
  score: number;
};

export type DemoPost = {
  slug: string;
  id: string;
  title: string;
  author: string;
  room: string;
  href: string;
  excerpt: string;
  body: string;
  commentsCount: number;
  createdAt: string;
  score: number;
  comments: DemoComment[];
};

export const demoPosts: DemoPost[] = [
  {
    slug: "research-question",
    id: "post-research-question",
    title: "How do I make my research question more testable?",
    author: "ResearchNerd",
    room: "Research Help",
    href: "/posts/research-question",
    excerpt: "I have a broad topic on education outcomes, but I need to turn it into a focused empirical question.",
    body: "I have a broad topic on education outcomes, but I need to turn it into a focused empirical question with a clear outcome, mechanism, and measurable context.",
    commentsCount: 18,
    createdAt: "2h ago",
    score: 127,
    comments: [
      {
        id: "comment-rq-1",
        author: "MethodMentor",
        role: "Methods Mentor",
        body: "Start by naming one outcome variable, one treatment or exposure, and one setting. Then ask whether the relationship can be tested with observable data.",
        createdAt: "1h ago",
        score: 42,
      },
      {
        id: "comment-rq-2",
        author: "GradCoach",
        role: "PhD Advisor",
        body: "A good testable question should sound like something that can become a regression, comparison, experiment, or structured qualitative design.",
        createdAt: "45m ago",
        score: 31,
      },
    ],
  },
  {
    slug: "scholarship-warning",
    id: "post-scholarship-warning",
    title: "Reminder: verify scholarship links before applying",
    author: "ScholarshipWatch",
    room: "Scholarships",
    href: "/posts/scholarship-warning",
    excerpt: "Avoid pages that ask for payment before showing eligibility details or official application portals.",
    body: "Avoid pages that ask for payment before showing eligibility details or official application portals. Always verify from the university, foundation, or government website.",
    commentsCount: 31,
    createdAt: "4h ago",
    score: 86,
    comments: [
      {
        id: "comment-sw-1",
        author: "VisaGuide",
        role: "Study Abroad Mentor",
        body: "Also check whether the scholarship email domain matches the official institution domain.",
        createdAt: "3h ago",
        score: 28,
      },
    ],
  },
  {
    slug: "phd-email",
    id: "post-phd-email",
    title: "What should I write in a first email to a potential PhD supervisor?",
    author: "GradCoach",
    room: "PhD Admissions",
    href: "/posts/phd-email",
    excerpt: "Keep it short, specific, and tied to the professor's work. Avoid sending a generic biography.",
    body: "Keep it short, specific, and tied to the professor's work. Avoid sending a generic biography. Mention the professor's paper, explain the fit in one or two sentences, and ask a precise question.",
    commentsCount: 24,
    createdAt: "6h ago",
    score: 54,
    comments: [
      {
        id: "comment-pe-1",
        author: "ResearchNerd",
        role: "Research Mentor",
        body: "Mention one paper, one research fit, and one concise question. Attach CV only if the professor asks or the norm supports it.",
        createdAt: "5h ago",
        score: 35,
      },
    ],
  },
  {
    slug: "study-abroad-budget",
    id: "post-study-abroad-budget",
    title: "Canada vs Germany: how should I compare real study-abroad costs?",
    author: "VisaGuide",
    room: "Study Abroad",
    href: "/posts/study-abroad-budget",
    excerpt: "Compare tuition, living costs, proof-of-funds, work rights, and post-study pathways together.",
    body: "Compare tuition, living costs, proof-of-funds, work rights, and post-study pathways together. A country with low tuition may still require higher proof-of-funds or have stricter work limits.",
    commentsCount: 16,
    createdAt: "8h ago",
    score: 42,
    comments: [
      {
        id: "comment-sab-1",
        author: "LinaStudy",
        role: "Study Abroad Applicant",
        body: "Proof-of-funds can change the real affordability picture even when tuition looks low.",
        createdAt: "7h ago",
        score: 19,
      },
    ],
  },
  {
    slug: "programming-ai",
    id: "post-programming-ai",
    title: "Best way to learn Python for data analysis before graduate school?",
    author: "AIBuilder",
    room: "Programming and AI",
    href: "/posts/programming-ai",
    excerpt: "Start with pandas, visualization, basic statistics, and reproducible notebooks.",
    body: "Start with pandas, visualization, basic statistics, and reproducible notebooks. Build one small project from raw data to cleaned data, table, chart, and written interpretation.",
    commentsCount: 13,
    createdAt: "10h ago",
    score: 39,
    comments: [
      {
        id: "comment-pa-1",
        author: "MethodMentor",
        role: "Methods Mentor",
        body: "Learn by cleaning a real dataset and reproducing one simple table and one chart.",
        createdAt: "9h ago",
        score: 26,
      },
    ],
  },
];

export function getDemoPostBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return demoPosts.find((post) => post.slug === slug || post.id === slug);
}
