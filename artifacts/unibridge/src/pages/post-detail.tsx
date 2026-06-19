import { Link, useLocation, useRoute } from "wouter";
import { MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { VoteButtons } from "@/components/vote-buttons";
import { getDemoPostBySlug, type DemoComment } from "@/lib/demo-posts-store";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const [location] = useLocation();
  const fallbackSlug = location.split("/posts/")[1]?.split("?")[0]?.replace(/^\//, "");
  const slug = params?.id ?? fallbackSlug;
  const post = getDemoPostBySlug(slug);

  const [draft, setDraft] = useState("");
  const [extraComments, setExtraComments] = useState<DemoComment[]>([]);

  const comments = useMemo(() => {
    if (!post) return [];
    return [...post.comments, ...extraComments];
  }, [post, extraComments]);

  if (!post) {
    return (
      <section className="rounded-[2rem] border bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black">Post not found</h1>
        <p className="mt-2 text-slate-600">This post does not exist.</p>
        <Link href="/" className="mt-5 inline-flex rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white">
          Return home
        </Link>
      </section>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setExtraComments((items) => [
      ...items,
      {
        id: `comment-local-${Date.now()}`,
        author: "You",
        role: "Member",
        body,
        createdAt: "just now",
        score: 1,
      },
    ]);

    setDraft("");
  };

  return (
    <div className="space-y-6">
      <article className="rounded-[2rem] border bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <VoteButtons itemId={post.id} baseScore={post.score} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              <Link href={`/rooms/${post.room.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">
                {post.room}
              </Link>
              <span>Posted by {post.author}</span>
              <span>{post.createdAt}</span>
            </div>

            <h1 className="mt-3 text-3xl font-black">{post.title}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-700">{post.body}</p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-500">
              <MessageCircle className="h-4 w-4" />
              {comments.length} comments
            </div>
          </div>
        </div>
      </article>

      <form onSubmit={submit} className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Add a comment</h2>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a helpful reply..."
            className="min-w-0 flex-1 rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            <Send className="h-4 w-4" />
            Reply
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Comments</h2>

        {comments.map((comment) => (
          <article key={comment.id} className="rounded-3xl border bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <VoteButtons itemId={comment.id} baseScore={comment.score} compact />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="font-black text-slate-900">{comment.author}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{comment.role}</span>
                  <span>{comment.createdAt}</span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-700">{comment.body}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100">Reply</button>
                  <button className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100">Save</button>
                  <button className="rounded-full px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100">Report</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
