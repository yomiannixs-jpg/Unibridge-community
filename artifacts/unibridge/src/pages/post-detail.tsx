import { Link, useLocation, useRoute } from "wouter";
import { ChevronDown, ChevronRight, MessageCircle, Pin, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { VoteButtons } from "@/components/vote-buttons";
import { getDemoPostBySlug, type DemoComment } from "@/lib/demo-posts-store";
import { getUserKarma, MentionText, UserHoverCard } from "@/components/user-hover-card";
import { UserActionMenu } from "@/components/user-action-menu";
import { KarmaBadge } from "@/components/karma-badge";

type ThreadedComment = DemoComment & {
  parentId?: string;
  badge?: "OP" | "MOD" | "EXPERT";
  awards?: string[];
  pinned?: boolean;
};

type SortMode = "Top" | "New" | "Old";

function parseAge(value: string) {
  if (value === "just now") return 0;
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return 999999;
  if (value.includes("m")) return number;
  if (value.includes("h")) return number * 60;
  if (value.includes("d")) return number * 60 * 24;
  return 999999;
}

function Badge({ badge }: { badge?: ThreadedComment["badge"] }) {
  if (!badge) return null;

  const style =
    badge === "OP"
      ? "bg-blue-50 text-blue-800"
      : badge === "MOD"
        ? "bg-emerald-50 text-emerald-800"
        : "bg-yellow-50 text-yellow-800";

  return <span className={`rounded-full px-2 py-1 text-[10px] font-black ${style}`}>{badge}</span>;
}

function Awards({ awards }: { awards?: string[] }) {
  if (!awards?.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {awards.map((award, index) => (
        <span key={`${award}-${index}`} className="rounded-full bg-yellow-50 px-2 py-1 text-xs font-black text-yellow-800">
          {award}
        </span>
      ))}
    </div>
  );
}

function CommentTree({
  comment,
  childrenComments,
  renderChildren,
  onReply,
  onSave,
  onReport,
  onMention,
  saved,
  reported,
  depth = 0,
}: {
  comment: ThreadedComment;
  childrenComments: ThreadedComment[];
  renderChildren: (parentId: string, depth: number) => React.ReactNode;
  onReply: (comment: ThreadedComment) => void;
  onSave: (commentId: string) => void;
  onReport: (commentId: string) => void;
  onMention: (username: string) => void;
  saved: boolean;
  reported: boolean;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const childCount = childrenComments.length;
  const karma = getUserKarma(comment.author);

  return (
    <article className={`${depth > 0 ? "border-l-2 border-blue-100 pl-4" : ""}`}>
      <div className={`rounded-3xl border bg-white p-4 shadow-sm ${comment.pinned ? "border-blue-300 bg-blue-50/40" : ""}`}>
        {comment.pinned ? (
          <div className="mb-3 flex items-center gap-2 text-xs font-black text-blue-800">
            <Pin className="h-4 w-4" />
            Pinned moderator comment
          </div>
        ) : null}

        <div className="flex items-start gap-3">
          <div className="pt-1">
            <VoteButtons itemId={comment.id} baseScore={comment.score} compact />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
              <button type="button" onClick={() => setShowActions((value) => !value)} className="text-left">
                <UserHoverCard name={comment.author} />
              </button>
              <Badge badge={comment.badge} />
              <KarmaBadge karma={karma} />
              <span className="rounded-full bg-slate-100 px-2 py-1">{comment.role}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 font-black text-emerald-800">{karma} karma</span>
              <span>{comment.createdAt}</span>
            </div>

            {showActions ? <UserActionMenu name={comment.author} onMention={onMention} /> : null}

            <Awards awards={comment.awards} />

            <p className="mt-2 text-sm leading-6 text-slate-700">
              <MentionText text={comment.body} />
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => onReply(comment)} className="rounded-full px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">
                Reply
              </button>

              <button type="button" onClick={() => onSave(comment.id)} className={`rounded-full px-3 py-1 text-xs font-bold ${saved ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-100"}`}>
                {saved ? "Saved" : "Save"}
              </button>

              <button type="button" onClick={() => onReport(comment.id)} className={`rounded-full px-3 py-1 text-xs font-bold ${reported ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-100"}`}>
                {reported ? "Reported" : "Report"}
              </button>

              {childCount ? (
                <button type="button" onClick={() => setExpanded((value) => !value)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black text-blue-800 hover:bg-blue-50">
                  {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  {expanded ? "Hide" : "Show"} {childCount} {childCount === 1 ? "reply" : "replies"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {expanded && childCount ? <div className="mt-3 space-y-3">{renderChildren(comment.id, depth + 1)}</div> : null}
    </article>
  );
}

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const [location] = useLocation();

  const fallbackSlug = location.startsWith("/posts/")
    ? location.slice("/posts/".length).split("?")[0]
    : undefined;

  const slug = params?.id ?? fallbackSlug;
  const post = getDemoPostBySlug(slug);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<ThreadedComment | null>(null);
  const [savedComments, setSavedComments] = useState<string[]>([]);
  const [reportedComments, setReportedComments] = useState<string[]>([]);
  const [extraComments, setExtraComments] = useState<ThreadedComment[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("Top");

  const baseReplies: ThreadedComment[] = useMemo(() => {
    if (!post) return [];
    const first = post.comments[0];
    const second = post.comments[1];

    return [
      {
        id: `${post.id}-pinned`,
        author: "MethodMentor",
        role: "Methods Mentor",
        badge: "MOD",
        pinned: true,
        awards: ["🏆 x4", "🎓 x2"],
        body: "Before replying, try to state the outcome variable, the treatment or exposure, the sample, and the period. This makes the discussion much easier to help with.",
        createdAt: "1h ago",
        score: 76,
      },
      ...(first
        ? [
            {
              id: `${first.id}-reply-1`,
              parentId: first.id,
              author: "ResearchNerd",
              role: "Research Mentor",
              badge: "EXPERT",
              awards: ["⭐ x2"],
              body: "@You this is useful. I would also add that the context should be narrow enough to find data.",
              createdAt: "35m ago",
              score: 18,
            },
            {
              id: `${first.id}-reply-2`,
              parentId: first.id,
              author: "You",
              role: "Member",
              badge: "OP",
              body: "So I should start from the data and not only the idea?",
              createdAt: "20m ago",
              score: 6,
            },
            {
              id: `${first.id}-reply-2-child`,
              parentId: `${first.id}-reply-2`,
              author: "MethodMentor",
              role: "Methods Mentor",
              badge: "MOD",
              body: "@You yes. Start from a research idea, but quickly check whether the data can actually measure it.",
              createdAt: "15m ago",
              score: 11,
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
              badge: "MOD",
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
    const originalComments = post.comments.map((comment, index) => ({
      ...comment,
      badge: comment.author === post.author ? "OP" as const : index === 0 ? "EXPERT" as const : undefined,
      awards: index === 0 ? ["🏆 x1"] : undefined,
    }));

    return [...originalComments, ...baseReplies, ...extraComments] as ThreadedComment[];
  }, [post, baseReplies, extraComments]);

  const sortedTopLevelComments = useMemo(() => {
    const top = allComments.filter((comment) => !comment.parentId);
    const pinned = top.filter((comment) => comment.pinned);
    const normal = top.filter((comment) => !comment.pinned);

    const sorted = [...normal].sort((a, b) => {
      if (sortMode === "Top") return b.score - a.score;
      if (sortMode === "New") return parseAge(a.createdAt) - parseAge(b.createdAt);
      return parseAge(b.createdAt) - parseAge(a.createdAt);
    });

    return [...pinned, ...sorted];
  }, [allComments, sortMode]);

  const childComments = (parentId: string) =>
    allComments.filter((comment) => comment.parentId === parentId).sort((a, b) => b.score - a.score);

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

  const mentionUser = (username: string) => {
    setDraft((value) => {
      const mention = `@${username} `;
      return value.includes(mention) ? value : `${mention}${value}`;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        badge: "OP",
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

  const renderChildren = (parentId: string, depth: number): React.ReactNode =>
    childComments(parentId).map((child) => (
      <CommentTree
        key={child.id}
        comment={child}
        childrenComments={childComments(child.id)}
        renderChildren={renderChildren}
        depth={depth}
        onReply={(item) => {
          setReplyingTo(item);
          setDraft(`@${item.author} `);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onMention={mentionUser}
        onSave={toggleSaved}
        onReport={toggleReported}
        saved={savedComments.includes(child.id)}
        reported={reportedComments.includes(child.id)}
      />
    ));

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
              <UserHoverCard name={post.author} />
              <KarmaBadge karma={getUserKarma(post.author)} />
              <span className="rounded-full bg-emerald-50 px-2 py-1 font-black text-emerald-800">
                {getUserKarma(post.author)} karma
              </span>
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
        <h2 className="text-lg font-black">{replyingTo ? `Replying to ${replyingTo.author}` : "Add a comment"}</h2>

        {replyingTo ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">Threaded reply</span>
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setDraft("");
              }}
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
            placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Write a helpful reply or @mention someone..."}
            className="min-w-0 flex-1 rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            <Send className="h-4 w-4" />
            Reply
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 rounded-3xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black">Comments</h2>
          <div className="flex flex-wrap gap-2">
            {(["Top", "New", "Old"] as SortMode[]).map((item) => (
              <button
                key={item}
                onClick={() => setSortMode(item)}
                className={`rounded-full px-4 py-2 text-xs font-black ${
                  sortMode === item ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {sortedTopLevelComments.map((comment) => (
          <CommentTree
            key={comment.id}
            comment={comment}
            childrenComments={childComments(comment.id)}
            renderChildren={renderChildren}
            onReply={(item) => {
              setReplyingTo(item);
              setDraft(`@${item.author} `);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMention={mentionUser}
            onSave={toggleSaved}
            onReport={toggleReported}
            saved={savedComments.includes(comment.id)}
            reported={reportedComments.includes(comment.id)}
          />
        ))}
      </section>
    </div>
  );
}
