import { Link, useLocation, useRoute } from "wouter";
import { MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { VoteButtons } from "@/components/vote-buttons";
import { getDemoPostBySlug, type DemoComment } from "@/lib/demo-posts-store";

type ThreadedComment = DemoComment & {
  parentId?: string;
};

function userSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function CommentCard({
  comment,
  children,
  onReply,
  onSave,
  onReport,
  saved,
  reported,
  depth = 0,
}: {
  comment: ThreadedComment;
  children?: React.ReactNode;
  onReply: (comment: ThreadedComment) => void;
  onSave: (commentId: string) => void;
  onReport: (commentId: string) => void;
  saved: boolean;
  reported: boolean;
  depth?: number;
}) {
  return (
    <article className={`${depth > 0 ? "border-l-2 border-blue-100 pl-4" : ""}`}>
      <div className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <VoteButtons itemId={comment.id} baseScore={comment.score} compact />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              {comment.author === "You" ? (
                <span className="font-black text-slate-900">You</span>
              ) : (
                <Link href={`/u/${userSlug(comment.author)}`} className="font-black text-blue-700 hover:underline">
                  {comment.author}
                </Link>
              )}
              <span className="rounded-full bg-slate-100 px-2 py-1">{comment.role}</span>
              <span>{comment.createdAt}</span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-700">{comment.body}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="rounded-full px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Reply
              </button>

              <button
                type="button"
                onClick={() => onSave(comment.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  saved ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {saved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={() => onReport(comment.id)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  reported ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {reported ? "Reported" : "Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {children ? <div className="mt-3 space-y-3">{children}</div> : null}
    </article>
  );
}

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const [location] = useLocation();
  const fallbackSlug = location.split("/posts/")[1]?.split("?")[0]?.replace(/^\//, "");
  const slug = params?.id ?? fallbackSlug;
  const post = getDemoPostBySlug(slug);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<ThreadedComment | null>(null);
  const [savedComments, setSavedComments] = useState<string[]>([]);
  const [reportedComments, setReportedComments] = useState<string[]>([]);
  const [extraComments, setExtraComments] = useState<ThreadedComment[]>([]);

  const baseReplies: ThreadedComment[] = useMemo(() => {
    if (!post) return [];
    const first = post.comments[0];
    const second = post.comments[1];

    return [
      ...(first
        ? [
            {
              id: `${first.id}-reply-1`,
              parentId: first.id,
              author: "ResearchNerd",
              role: "Research Mentor",
              body: "This is useful. I would also add that the context should be narrow enough to find data.",
              createdAt: "35m ago",
              score: 18,
            },
            {
              id: `${first.id}-reply-2`,
              parentId: first.id,
              author: "You",
              role: "Member",
              body: "So I should start from the data and not only the idea?",
              createdAt: "20m ago",
              score: 6,
            },
          ]
        : []),
      ...(second
        ? [
            {
              id: `${second.id}-reply-1`,
              parentId: second.id,
              author: "MethodMentor",
              role: "Methods Mentor",
              body: "Exactly. If the question cannot become a comparison, it is probably still too broad.",
              createdAt: "18m ago",
              score: 14,
            },
          ]
        : []),
    ];
  }, [post]);

  const allComments = useMemo(() => {
    if (!post) return [];
    return [...post.comments, ...baseReplies, ...extraComments] as ThreadedComment[];
  }, [post, baseReplies, extraComments]);

  const topLevelComments = allComments.filter((comment) => !comment.parentId);

  const childComments = (parentId: string) =>
    allComments.filter((comment) => comment.parentId === parentId);

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
        parentId: replyingTo?.id,
        author: "You",
        role: "Member",
        body,
        createdAt: "just now",
        score: 1,
      },
    ]);

    setDraft("");
    setReplyingTo(null);
  };

  const toggleSaved = (commentId: string) => {
    setSavedComments((items) =>
      items.includes(commentId) ? items.filter((id) => id !== commentId) : [...items, commentId],
    );
  };

  const toggleReported = (commentId: string) => {
    setReportedComments((items) =>
      items.includes(commentId) ? items.filter((id) => id !== commentId) : [...items, commentId],
    );
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
              <span>Posted by</span>
              <Link href={`/u/${userSlug(post.author)}`} className="font-black text-blue-700 hover:underline">
                {post.author}
              </Link>
              <span>{post.createdAt}</span>
            </div>

            <h1 className="mt-3 text-3xl font-black">{post.title}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-700">{post.body}</p>

            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-500">
              <MessageCircle className="h-4 w-4" />
              {allComments.length} comments
            </div>
          </div>
        </div>
      </article>

      <form onSubmit={submit} className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">
          {replyingTo ? `Replying to ${replyingTo.author}` : "Add a comment"}
        </h2>

        {replyingTo ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
              Threaded reply
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancel reply
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Write a helpful reply..."}
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

        {topLevelComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onReply={(item) => {
              setReplyingTo(item);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSave={toggleSaved}
            onReport={toggleReported}
            saved={savedComments.includes(comment.id)}
            reported={reportedComments.includes(comment.id)}
          >
            {childComments(comment.id).map((child) => (
              <CommentCard
                key={child.id}
                comment={child}
                depth={1}
                onReply={(item) => {
                  setReplyingTo(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSave={toggleSaved}
                onReport={toggleReported}
                saved={savedComments.includes(child.id)}
                reported={reportedComments.includes(child.id)}
              />
            ))}
          </CommentCard>
        ))}
      </section>
    </div>
  );
}
