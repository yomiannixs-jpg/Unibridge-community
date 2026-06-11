import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowBigUp, Bookmark, MessageCircle, Users } from "lucide-react";
import { loadStore, saveStore, timeAgo, type Post } from "@/lib/community-store";
import { apiGet, apiPost } from "@/lib/api";

function PostCard({ post, onVote, onSave, saved }: { post: Post; onVote: (id: string) => void; onSave: (id: string) => void; saved: boolean }) {
  return (
    <article className="overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex gap-4 p-5">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-2xl bg-slate-50 py-2">
          <button onClick={() => onVote(post.id)} className="rounded-full p-1 text-slate-500 hover:bg-blue-100 hover:text-blue-700" aria-label="upvote">
            <ArrowBigUp className="h-6 w-6" />
          </button>
          <span className="text-sm font-black">{post.votes}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {post.pinned && <span className="rounded-full bg-blue-100 px-2 py-1 font-bold text-blue-800">PINNED</span>}
            <Link href={`/d/${post.communitySlug}`} className="font-bold text-slate-900 hover:text-blue-700">d/{post.communitySlug}</Link>
            <span>•</span><span>Posted by {post.author}</span><span>•</span><span>{timeAgo(post.createdAt)}</span>
          </div>
          <Link href={`/posts/${post.id}`}>
            <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 hover:text-blue-700">{post.title}</h2>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(post.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{tag}</span>)}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm font-semibold text-slate-500">
            <Link href={`/posts/${post.id}`} className="flex items-center gap-1 hover:text-blue-700"><MessageCircle className="h-4 w-4" /> {post.comments} comments</Link>
            <button onClick={() => onSave(post.id)} className={`flex items-center gap-1 ${saved ? "text-blue-700" : "hover:text-blue-700"}`}><Bookmark className="h-4 w-4" /> {saved ? "Saved" : "Save"}</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [store, setStore] = useState(loadStore());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    const sync = () => setStore(loadStore());
    window.addEventListener("unibridge-store-updated", sync);
    return () => window.removeEventListener("unibridge-store-updated", sync);
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (filter !== "all") params.set("subbridge", filter);
    if (search.trim()) params.set("search", search.trim());
    apiGet<any[]>(`/api/feed${params.toString() ? `?${params.toString()}` : ""}`)
      .then((items) => {
        if (!active) return;
        const apiPosts: Post[] = items.map((item) => ({
          id: item.id,
          communitySlug: item.subbridgeSlug,
          title: item.title,
          body: item.body,
          author: item.author,
          authorRole: item.authorRole,
          tags: item.tags ?? [],
          votes: item.votes ?? 0,
          comments: item.comments ?? 0,
          createdAt: item.createdAt,
          pinned: item.pinned,
        }));
        const current = loadStore();
        const next = { ...current, posts: apiPosts.length ? apiPosts : current.posts };
        setStore(next);
        saveStore(next);
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
    return () => { active = false; };
  }, [filter, search]);

  const posts = useMemo(() => {
    const sorted = [...(store.posts ?? [])].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.votes - a.votes);
    const filtered = filter === "all" ? sorted : sorted.filter((p) => p.communitySlug === filter);
    const q = search.trim().toLowerCase();
    return q ? filtered.filter((p) => [p.title, p.body, p.author, p.communitySlug, ...p.tags].join(" ").toLowerCase().includes(q)) : filtered;
  }, [filter, search, store.posts]);

  const uniquePosts = useMemo(() => {
    return posts.filter(
      (post, index, self) =>
        index === self.findIndex((p) => p.id === post.id),
    );
  }, [posts]);

  const updatePost = (id: string, updater: (p: Post) => Post) => {
    const next = { ...store, posts: (store.posts ?? []).map((p) => (p.id === id ? updater(p) : p)) };
    setStore(next); saveStore(next);
  };

  const votePost = (id: string) => {
    updatePost(id, (p) => ({ ...p, votes: p.votes + 1 }));
    apiPost(`/api/subbridge-posts/${id}/upvote`).catch(() => {});
  };

  const toggleSave = (id: string) => {
    const saved = store.saved.includes(id) ? store.saved.filter((x) => x !== id) : [...store.saved, id];
    const next = { ...store, saved };
    setStore(next); saveStore(next);
    apiPost(`/api/subbridge-posts/${id}/save`).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-red-800 p-6 text-white shadow-sm md:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Education community network</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Ask, share, vote, and learn inside student-led Hubs.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">CollegeDiscourse is organized as a collaborative educational network featuring specialized Hubs, discussion boards, peer insights, bookmarked materials, academic resources, mentorship programs, scholarships, and expert-moderated forums.</p>
          <div className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">{apiOnline ? "Live Render API connected" : "Local fallback active"}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/create" className="rounded-full bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">Create a post</Link>
            <Link href="/communities" className="rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/20">Explore Hubs</Link>
          </div>
        </div>
      </section>

      <div className="rounded-3xl border bg-white p-4 shadow-sm"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts, tags, SubDiscourses, scholarships, visas, research help..." className="w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300" /></div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === "all" ? "bg-slate-950 text-white" : "bg-white text-slate-600 border"}`}>All</button>
        {(store.communities ?? []).map((c) => {
          const joined = store.joined.includes(c.slug);
          return (
            <button
              key={c.slug}
              onClick={() => setFilter(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                filter === c.slug ? "bg-slate-950 text-white" : joined ? "border bg-blue-50 text-blue-800" : "border bg-white text-slate-600"
              }`}
            >
              d/{c.slug}{joined ? " · Joined" : ""}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {uniquePosts.map((post) => <PostCard key={post.id} post={post} saved={store.saved.includes(post.id)} onVote={votePost} onSave={toggleSave} />)}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/communities" className="rounded-3xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-md">
          <Users className="mb-3 h-6 w-6 text-blue-700" />
          <b>Hubs first</b>
          <p className="mt-2 text-sm text-slate-600">Explore specialized SubDiscourses for scholarships, study abroad, research help, careers, and academic support.</p>
        </Link>
        <Link href="/communities" className="rounded-3xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-md">
          <MessageCircle className="mb-3 h-6 w-6 text-blue-700" />
          <b>Threaded discussions</b>
          <p className="mt-2 text-sm text-slate-600">Join topic-based discussions with posts, replies, voting, saved posts, and peer insights.</p>
        </Link>
        <Link href="/resources" className="rounded-3xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-md">
          <Bookmark className="mb-3 h-6 w-6 text-blue-700" />
          <b>Education resources</b>
          <p className="mt-2 text-sm text-slate-600">Open scholarships, guides, templates, research materials, and mentor-led academic resources.</p>
        </Link>
      </section>
    </div>
  );
}
