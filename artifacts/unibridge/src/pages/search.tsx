import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Bookmark, FileText, Hash, MessageCircle, Search as SearchIcon, TrendingUp, Users } from "lucide-react";
import { loadStore, timeAgo } from "@/lib/community-store";

const resourceItems = [
  {
    title: "Scholarship application checklist",
    type: "Guide",
    community: "scholarships",
    body: "A practical checklist for eligibility, essays, recommendation letters, deadlines, and funding documents.",
  },
  {
    title: "Study abroad country comparison sheet",
    type: "Worksheet",
    community: "study-abroad",
    body: "Compare tuition, visa pathway, cost of living, work rights, and long-term career opportunities.",
  },
  {
    title: "Research question refinement template",
    type: "Template",
    community: "research-help",
    body: "Move from a broad topic to a focused, testable, and meaningful research question.",
  },
  {
    title: "Professor email structure for PhD applicants",
    type: "Template",
    community: "phd-admissions",
    body: "A respectful supervisor outreach structure with timing, subject line, and common mistakes to avoid.",
  },
];

type Filter = "all" | "posts" | "hubs" | "resources";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const store = loadStore();

  const normalizedQuery = query.trim().toLowerCase();

  const posts = useMemo(() => {
    const allPosts = [...(store.posts ?? [])].sort((a, b) => b.votes - a.votes);
    if (!normalizedQuery) return allPosts.slice(0, 8);
    return allPosts.filter((post) =>
      [post.title, post.body, post.author, post.communitySlug, ...(post.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, store.posts]);

  const hubs = useMemo(() => {
    const allHubs = [...(store.communities ?? [])].sort((a, b) => b.members - a.members);
    if (!normalizedQuery) return allHubs.slice(0, 8);
    return allHubs.filter((hub) =>
      [hub.name, hub.slug, hub.description, ...(hub.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, store.communities]);

  const resources = useMemo(() => {
    if (!normalizedQuery) return resourceItems;
    return resourceItems.filter((resource) =>
      [resource.title, resource.type, resource.community, resource.body]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const showPosts = filter === "all" || filter === "posts";
  const showHubs = filter === "all" || filter === "hubs";
  const showResources = filter === "all" || filter === "resources";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
            <SearchIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Search and discovery</p>
            <h1 className="mt-2 text-3xl font-black">Find posts, Hubs, and resources</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search across CollegeDiscourse discussions, SubDiscourses, scholarship resources, research support, and study-abroad guidance.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-slate-50 p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 focus-within:ring-blue-300">
            <SearchIcon className="h-5 w-5 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search scholarships, PhD admissions, research methods, AI, visas..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "posts", "hubs", "resources"] as Filter[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                filter === item ? "bg-slate-950 text-white" : "border bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              {item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {!normalizedQuery && (
        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/d/scholarships" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <TrendingUp className="mb-3 h-6 w-6 text-blue-700" />
            <h2 className="font-black">Scholarship replies</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Jump into funding discussions and recently active scholarship threads.</p>
          </Link>
          <Link href="/d/study-abroad" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <Users className="mb-3 h-6 w-6 text-blue-700" />
            <h2 className="font-black">Study abroad questions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Explore admissions, visas, budgets, country comparisons, and relocation planning.</p>
          </Link>
          <Link href="/d/research-help" className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <MessageCircle className="mb-3 h-6 w-6 text-blue-700" />
            <h2 className="font-black">Research methods</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Find discussions on literature reviews, methods, datasets, and academic writing.</p>
          </Link>
        </section>
      )}

      {showPosts && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Posts</h2>
            <span className="text-sm font-semibold text-slate-500">{posts.length} result{posts.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-3">
            {posts.length ? posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">d/{post.communitySlug}</span>
                  <span>{post.votes} votes</span>
                  <span>•</span>
                  <span>{post.comments} comments</span>
                  <span>•</span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
                <h3 className="mt-3 text-lg font-black text-slate-950">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{post.body}</p>
              </Link>
            )) : <div className="rounded-3xl border bg-white p-8 text-center text-sm text-slate-500">No posts found.</div>}
          </div>
        </section>
      )}

      {showHubs && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Hubs</h2>
            <span className="text-sm font-semibold text-slate-500">{hubs.length} result{hubs.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {hubs.length ? hubs.map((hub) => (
              <Link key={hub.slug} href={`/d/${hub.slug}`} className="block rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${hub.color}`} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{hub.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-blue-800">d/{hub.slug}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{hub.members.toLocaleString()} members</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{hub.description}</p>
              </Link>
            )) : <div className="rounded-3xl border bg-white p-8 text-center text-sm text-slate-500">No Hubs found.</div>}
          </div>
        </section>
      )}

      {showResources && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Resources</h2>
            <span className="text-sm font-semibold text-slate-500">{resources.length} result{resources.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {resources.length ? resources.map((resource) => (
              <Link key={resource.title} href={`/d/${resource.community}`} className="block rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <FileText className="h-4 w-4 text-blue-700" />
                  <span>{resource.type}</span>
                  <span>•</span>
                  <span>d/{resource.community}</span>
                </div>
                <h3 className="mt-3 text-lg font-black">{resource.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{resource.body}</p>
              </Link>
            )) : <div className="rounded-3xl border bg-white p-8 text-center text-sm text-slate-500">No resources found.</div>}
          </div>
        </section>
      )}
    </div>
  );
}
