import { Link } from "wouter";
import { Bookmark, MessageCircle, Search } from "lucide-react";
import { loadStore, timeAgo } from "@/lib/community-store";

export default function SavedPosts() {
  const store = loadStore();
  const savedPosts = (store.posts ?? []).filter((post) => (store.saved ?? []).includes(post.id));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">Saved library</p>
            <h1 className="mt-2 text-3xl font-black">Saved posts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Keep useful scholarship posts, research answers, templates, and SubDiscourse discussions here. Saved posts are stored locally first and API-ready for backend persistence.
            </p>
          </div>
        </div>
      </section>

      {savedPosts.length ? (
        <div className="grid gap-4">
          {savedPosts.map((post) => (
            <article key={post.id} className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <Link href={`/d/${post.communitySlug}`} className="text-blue-800 hover:text-blue-900">d/{post.communitySlug}</Link>
                <span>•</span>
                <span>{post.author}</span>
                <span>•</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
              <Link href={`/posts/${post.id}`}>
                <h2 className="mt-2 text-xl font-black text-slate-950 hover:text-blue-700">{post.title}</h2>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.body}</p>
              <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm font-bold text-slate-500">
                <span>{post.votes} votes</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments} comments</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border bg-white p-10 text-center shadow-sm">
          <Search className="mx-auto h-10 w-10 text-blue-700" />
          <h2 className="mt-4 text-2xl font-black">No saved posts yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Save useful discussions from the Home Feed or Post Detail pages. They will appear here for quick reference.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            Browse posts
          </Link>
        </div>
      )}
    </div>
  );
}
