import { useState } from "react";
import { useLocation } from "wouter";
import { loadStore, saveStore, type Post } from "@/lib/community-store";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function NewPost() {
  const [store, setStore] = useState(loadStore());
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [communitySlug, setCommunitySlug] = useState((store.communities ?? [])[0]?.slug ?? "scholarships");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4);
    let post: Post = {
      id: `p${Date.now()}`,
      communitySlug,
      title: title.trim(),
      body: body.trim(),
      author: user?.displayName ?? "Guest",
      authorRole: user?.role ?? "Member",
      tags: tagList,
      votes: 1,
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      const created = await apiPost<any>(`/api/subbridges/${communitySlug}/posts`, {
        title: post.title,
        body: post.body,
        tags: tagList,
        author: user?.displayName ?? "Guest",
        authorRole: user?.role ?? "Member",
      });
      post = {
        id: created.id,
        communitySlug: created.subbridgeSlug,
        title: created.title,
        body: created.body,
        author: created.author,
        authorRole: created.authorRole,
        tags: created.tags ?? [],
        votes: created.votes ?? 1,
        comments: created.comments ?? 0,
        createdAt: created.createdAt,
        pinned: created.pinned,
      };
    } catch {}
    const next = { ...store, posts: [post, ...(store.posts ?? [])] };
    setStore(next); saveStore(next); navigate(`/posts/${post.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black">Create a post</h1>
        {!isAuthenticated && <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">You are posting as a guest. Login to attach posts to your CollegeDiscourse profile.</p>}
        <p className="mt-2 text-slate-600">Ask a question, share an opportunity, start a discussion, or post a guide inside a Hub.</p>
      </div>
      <div className="rounded-[2rem] border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="text-sm font-black text-slate-700">Hub</label>
          <select value={communitySlug} onChange={(e) => setCommunitySlug(e.target.value)} className="mt-2 w-full rounded-2xl border bg-slate-50 p-3 outline-none focus:border-blue-300">
            {(store.communities ?? []).map((c) => <option key={c.slug} value={c.slug}>d/{c.slug} — {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Is this scholarship legitimate?" className="mt-2 w-full rounded-2xl border bg-slate-50 p-3 outline-none focus:border-blue-300" />
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add context, country, deadline, budget, level of study, or what you have tried..." className="mt-2 min-h-52 w-full rounded-2xl border bg-slate-50 p-4 outline-none focus:border-blue-300" />
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Tags</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Scholarship, Masters, Visa" className="mt-2 w-full rounded-2xl border bg-slate-50 p-3 outline-none focus:border-blue-300" />
          <p className="mt-1 text-xs text-slate-500">Separate tags with commas.</p>
        </div>
        <button onClick={submit} className="w-full rounded-full bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50" disabled={!title.trim() || !body.trim()}>Publish post</button>
      </div>
    </div>
  );
}
