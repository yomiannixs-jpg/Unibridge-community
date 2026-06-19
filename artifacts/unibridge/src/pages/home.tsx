import { Link } from "wouter";
import { MessageCircle, RefreshCw } from "lucide-react";
import { VoteButtons } from "@/components/vote-buttons";
import { resetVotes } from "@/lib/vote-store";

const posts = [
  {
    id: "post-research-question",
    title: "How do I make my research question more testable?",
    author: "ResearchNerd",
    room: "Research Help",
    href: "/posts/research-question",
    excerpt: "I have a broad topic on education outcomes, but I need to turn it into a focused empirical question.",
    comments: 18,
    createdAt: "2h ago",
    score: 127,
  },
  {
    id: "post-scholarship-warning",
    title: "Reminder: verify scholarship links before applying",
    author: "ScholarshipWatch",
    room: "Scholarships",
    href: "/posts/scholarship-warning",
    excerpt: "Avoid pages that ask for payment before showing eligibility details or official application portals.",
    comments: 31,
    createdAt: "4h ago",
    score: 86,
  },
  {
    id: "post-phd-email",
    title: "What should I write in a first email to a potential PhD supervisor?",
    author: "GradCoach",
    room: "PhD Admissions",
    href: "/posts/phd-email",
    excerpt: "Keep it short, specific, and tied to the professor's work. Avoid sending a generic biography.",
    comments: 24,
    createdAt: "6h ago",
    score: 54,
  },
  {
    id: "post-study-abroad-budget",
    title: "Canada vs Germany: how should I compare real study-abroad costs?",
    author: "VisaGuide",
    room: "Study Abroad",
    href: "/posts/study-abroad-budget",
    excerpt: "Compare tuition, living costs, proof-of-funds, work rights, and post-study pathways together.",
    comments: 16,
    createdAt: "8h ago",
    score: 42,
  },
  {
    id: "post-programming-ai",
    title: "Best way to learn Python for data analysis before graduate school?",
    author: "AIBuilder",
    room: "Programming and AI",
    href: "/posts/programming-ai",
    excerpt: "Start with pandas, visualization, basic statistics, and reproducible notebooks.",
    comments: 13,
    createdAt: "10h ago",
    score: 39,
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">Home Feed</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Trending academic discussions, scholarship alerts, study-abroad questions, and research help.
            </p>
          </div>
          <button
            onClick={() => resetVotes()}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Reset votes
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <div className="flex gap-4">
              <VoteButtons itemId={post.id} baseScore={post.score} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <Link href={`/rooms/${post.room.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full bg-blue-50 px-2 py-1 text-blue-800 hover:bg-blue-100">
                    {post.room}
                  </Link>
                  <span>Posted by {post.author}</span>
                  <span>{post.createdAt}</span>
                </div>
                <Link href={post.href}>
                  <h2 className="mt-3 text-xl font-black hover:text-blue-700">{post.title}</h2>
                </Link>
                <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
                  <Link href={post.href} className="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-slate-100">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments} comments
                  </Link>
                  <VoteButtons itemId={post.id} baseScore={post.score} compact />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
