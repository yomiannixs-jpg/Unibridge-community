import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowBigUp, MessageCircle, Plus, Users } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { loadStore, saveStore, timeAgo, type Community as LocalCommunity, type Post } from "@/lib/community-store";

type ApiSubDiscourse = {
  id: number;
  slug: string;
  name: string;
  description: string;
  members: number;
  category: string;
  color: string;
  rules: string[];
  tags: string[];
};

type ApiPost = {
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
};

function toLocalCommunity(item: ApiSubDiscourse): LocalCommunity {
  return {
    id: String(item.id),
    slug: item.slug,
    name: item.name,
    description: item.description,
    members: item.members,
    color: item.color,
    rules: item.rules,
    tags: item.tags,
  };
}

function toLocalPost(item: ApiPost): Post {
  return {
    id: item.id,
    communitySlug: item.subbridgeSlug,
    title: item.title,
    body: item.body,
    author: item.author,
    authorRole: item.authorRole,
    tags: item.tags,
    votes: item.votes,
    comments: item.comments,
    createdAt: item.createdAt,
    pinned: item.pinned,
  };
}

export default function Community() {
  const params = useParams<{ slug?: string }>();
  const [store, setStore] = useState(loadStore());
  const [apiOnline, setApiOnline] = useState(false);
  const slug = params.slug;

  useEffect(() => {
    let active = true;
    apiGet<ApiSubDiscourse[]>("/api/subbridges")
      .then((items) => {
        if (!active) return;
        const next = { ...loadStore(), communities: (items ?? []).map(toLocalCommunity) };
        setStore(next);
        saveStore(next);
        setApiOnline(true);
      })
      .catch(() => setApiOnline(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    apiGet<ApiPost[]>(`/api/subbridges/${slug}/posts`)
      .then((items) => {
        if (!active) return;
        const current = loadStore();
        const apiPosts = (items ?? []).map(toLocalPost);
        const posts = [...current.posts.filter((post) => post.communitySlug !== slug), ...apiPosts];
        const next = { ...current, posts };
        setStore(next);
        saveStore(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  const community = slug ? store.communities.find((c) => c.slug === slug) : undefined;
  const communities = [...(store.communities ?? [])].sort((a, b) => b.members - a.members);
  const posts = useMemo(
    () => community ? (store.posts ?? []).filter((p) => p.communitySlug === community.slug).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.votes - a.votes) : [],
    [community, store.posts],
  );

  const toggleJoin = (communitySlug: string) => {
    const joined = store.joined.includes(communitySlug)
      ? store.joined.filter((x) => x !== communitySlug)
      : [...store.joined, communitySlug];
    const next = { ...store, joined };
    setStore(next);
    saveStore(next);
    if (!store.joined.includes(communitySlug)) {
      apiPost(`/api/subbridges/${communitySlug}/join`).catch(() => {});
    }
  };

  if (!community) {
    return (
      <div className="space-y-6">
        <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-black">Explore SubDiscourses</h1>
              <p className="mt-2 text-slate-600">Join education spaces organized by topic: scholarships, study abroad, research help, admissions, careers, AI, finance, and more.</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${apiOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{apiOnline ? "Connected to Render API" : "Using local fallback"}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {communities.map((c) => (
            <Link href={`/d/${c.slug}`} key={c.slug} className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`h-24 bg-gradient-to-br ${c.color}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black group-hover:text-blue-700">d/{c.slug}</h2>
                    <p className="text-sm font-semibold text-slate-500">{c.name}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{c.members.toLocaleString()} members</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">{(c.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{tag}</span>)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className={`h-32 bg-gradient-to-br ${community.color}`} />
        <div className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-3xl font-black">d/{community.slug}</h1>
              <p className="mt-2 max-w-2xl text-slate-600">{community.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500"><Users className="h-4 w-4" /> {community.members.toLocaleString()} members</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleJoin(community.slug)} className={`rounded-full px-5 py-2 text-sm font-bold ${store.joined.includes(community.slug) ? "bg-slate-200 text-slate-700" : "bg-red-600 text-white hover:bg-red-700"}`}>{store.joined.includes(community.slug) ? "Joined" : "Join"}</button>
              <Link href="/create" className="rounded-full border px-5 py-2 text-sm font-bold hover:bg-slate-50"><Plus className="mr-1 inline h-4 w-4" />Post</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {(posts ?? []).map((post) => (
            <article key={post.id} className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="flex w-12 shrink-0 flex-col items-center rounded-2xl bg-slate-50 py-2"><ArrowBigUp className="h-6 w-6 text-slate-500" /><span className="text-sm font-black">{post.votes}</span></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-500">{post.author} • {timeAgo(post.createdAt)}</div>
                  <Link href={`/posts/${post.id}`}><h2 className="mt-1 text-xl font-black hover:text-blue-700">{post.title}</h2></Link>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.body}</p>
                  <Link href={`/posts/${post.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-blue-700"><MessageCircle className="h-4 w-4" /> {post.comments} comments</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">About this SubDiscourse</h3><p className="mt-2 text-sm leading-6 text-slate-600">{community.description}</p></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">Rules</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">{(community.rules ?? []).map((r) => <li key={r}>{r}</li>)}</ol></div>
        </aside>
      </div>
    </div>
  );
}
