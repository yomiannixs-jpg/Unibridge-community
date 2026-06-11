import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowBigUp, Bookmark, MessageCircle, Send } from "lucide-react";
import { loadStore, saveStore, timeAgo, toggleSavedInStore, markPostVotedInStore, type Comment } from "@/lib/community-store";
import { apiGet, apiPost } from "@/lib/api";
import { addNotification } from "@/lib/notifications";

function CommentView({ comment }: { comment: Comment }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">{comment.author.slice(0, 1)}</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-500">{comment.author} • {timeAgo(comment.createdAt)}</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{comment.body}</p>
          <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500"><span className="flex items-center gap-1"><ArrowBigUp className="h-4 w-4" /> {comment.votes}</span><button className="hover:text-blue-700">Reply</button></div>
          {comment.replies?.length ? <div className="mt-4 space-y-3 border-l-2 pl-4">{comment.replies.map((reply) => <CommentView key={reply.id} comment={reply} />)}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState(loadStore());
  const [body, setBody] = useState("");
  const post = store.posts.find((p) => p.id === id);
  const community = post ? store.communities.find((c) => c.slug === post.communitySlug) : undefined;
  const comments = store.comments.filter((c) => c.postId === id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    apiGet<any[]>(`/api/subbridge-posts/${id}/comments`)
      .then((items) => {
        if (!active) return;
        const apiComments: Comment[] = items.map((item) => ({
          id: item.id,
          postId: item.postId,
          author: item.author,
          body: item.body,
          votes: item.votes ?? 0,
          createdAt: item.createdAt,
        }));
        const current = loadStore();
        const next = { ...current, comments: [...current.comments.filter((comment) => comment.postId !== id), ...apiComments] };
        setStore(next);
        saveStore(next);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [id]);

  if (!post) {
    return <div className="rounded-3xl border bg-white p-8 text-center"><h1 className="text-2xl font-black">Post not found</h1><Link href="/" className="mt-4 inline-block text-blue-700 font-bold">Return home</Link></div>;
  }

  const vote = () => {
    if (store.voted?.includes(post.id)) return;
    const next = markPostVotedInStore(post.id);
    setStore(next);
    addNotification({
      type: "vote",
      title: "Vote recorded",
      message: `Your upvote was added to “${post.title}”.`,
      href: `/posts/${post.id}`,
    });
    apiPost(`/api/subbridge-posts/${post.id}/upvote`).catch(() => {});
  };

  const toggleSave = () => {
    const next = toggleSavedInStore(post.id);
    setStore(next);
    addNotification({
      type: "save",
      title: next.saved.includes(post.id) ? "Post saved" : "Post removed from saved",
      message: next.saved.includes(post.id) ? `You saved “${post.title}”.` : `You removed “${post.title}” from saved posts.`,
      href: next.saved.includes(post.id) ? "/saved" : `/posts/${post.id}`,
    });
    apiPost(`/api/subbridge-posts/${post.id}/save`).catch(() => {});
  };

  const addComment = async () => {
    if (!body.trim()) return;
    let newComment: Comment = { id: `c${Date.now()}`, postId: post.id, author: "You", body: body.trim(), votes: 0, createdAt: new Date().toISOString() };
    try {
      const created = await apiPost<any>(`/api/subbridge-posts/${post.id}/comments`, { body: body.trim(), author: "You" });
      newComment = { id: created.id, postId: created.postId, author: created.author, body: created.body, votes: created.votes ?? 0, createdAt: created.createdAt };
    } catch {}
    const next = { ...store, comments: [newComment, ...(store.comments ?? [])], posts: (store.posts ?? []).map((p) => p.id === post.id ? { ...p, comments: p.comments + 1 } : p) };
    setStore(next); saveStore(next); setBody("");
    addNotification({
      type: "comment",
      title: "Comment added",
      message: `Your comment was added to “${post.title}”.`,
      href: `/posts/${post.id}`,
    });
  };

  return (
    <div className="space-y-5">
      <article className="rounded-[2rem] border bg-white p-5 shadow-sm md:p-7">
        <div className="flex gap-4">
          <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-slate-50 py-3">
            <button onClick={vote} className="rounded-full p-1 text-slate-500 hover:bg-blue-100 hover:text-blue-700"><ArrowBigUp className="h-7 w-7" /></button>
            <span className="font-black">{post.votes}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href={`/d/${post.communitySlug}`} className="font-black text-slate-900 hover:text-blue-700">d/{post.communitySlug}</Link>
              <span>•</span><span>{post.author}</span><span>•</span><span>{timeAgo(post.createdAt)}</span>
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight md:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">{(post.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{tag}</span>)}</div>
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">{post.body}</p>
            <div className="mt-6 flex items-center gap-4 border-t pt-5 text-sm font-bold text-slate-500"><span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {comments.length} comments</span><button onClick={toggleSave} className={store.saved.includes(post.id) ? "flex items-center gap-1 text-blue-700" : "flex items-center gap-1 hover:text-blue-700"}><Bookmark className="h-4 w-4" /> {store.saved.includes(post.id) ? "Saved" : "Save"}</button></div>
          </div>
        </div>
      </article>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-black">Join the discussion</h2>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share advice, ask a follow-up, or add a resource..." className="mt-3 min-h-28 w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-300" />
        <div className="mt-3 flex justify-end"><button onClick={addComment} className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700"><Send className="h-4 w-4" /> Comment</button></div>
      </section>

      <div className="grid gap-3">
        {comments.length ? (comments ?? []).map((comment) => <CommentView key={comment.id} comment={comment} />) : <div className="rounded-3xl border bg-white p-8 text-center text-slate-500">No comments yet. Be the first to respond.</div>}
      </div>

      {community && <section className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">More from d/{community.slug}</h3><p className="mt-2 text-sm text-slate-600">{community.description}</p></section>}
    </div>
  );
}
