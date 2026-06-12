import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { dmTimeAgo, loadDMThreads, markThreadRead, sendDM, type DMThread } from "@/lib/dm-store";

function ThreadButton({
  thread,
  active,
  onClick,
}: {
  thread: DMThread;
  active: boolean;
  onClick: () => void;
}) {
  const latest = thread.messages[thread.messages.length - 1];

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-3xl border p-4 text-left transition ${
        active ? "border-blue-300 bg-blue-50" : "bg-white hover:border-blue-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
          {thread.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-black">{thread.personName}</div>
            {thread.unread > 0 && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-black text-white">{thread.unread}</span>
            )}
          </div>
          <div className="text-xs font-bold text-blue-700">{thread.handle}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{latest?.body ?? "No messages yet."}</p>
        </div>
      </div>
    </button>
  );
}

export default function Messages() {
  const [threads, setThreads] = useState<DMThread[]>(() => loadDMThreads());
  const [activeId, setActiveId] = useState(() => loadDMThreads()[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => setThreads(loadDMThreads());
    window.addEventListener("collegediscourse-dm-updated", sync);
    return () => window.removeEventListener("collegediscourse-dm-updated", sync);
  }, []);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  const openThread = (threadId: string) => {
    setActiveId(threadId);
    setThreads(markThreadRead(threadId));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeThread) return;
    setThreads(sendDM(activeThread.id, draft));
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-7 w-7 text-blue-700" />
          <div>
            <h1 className="text-3xl font-black">Direct Messages</h1>
            <p className="mt-1 text-sm text-slate-600">
              Continue private conversations with mentors, contributors, and student helpers.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {threads.map((thread) => (
            <ThreadButton
              key={thread.id}
              thread={thread}
              active={activeThread?.id === thread.id}
              onClick={() => openThread(thread.id)}
            />
          ))}
        </aside>

        <main className="rounded-[2rem] border bg-white shadow-sm">
          {activeThread ? (
            <div className="flex min-h-[620px] flex-col">
              <header className="border-b p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
                    {activeThread.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{activeThread.personName}</h2>
                    <p className="text-sm text-slate-500">
                      {activeThread.handle} · {activeThread.role}
                    </p>
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {activeThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-4 py-3 ${
                        message.sender === "me"
                          ? "bg-blue-800 text-white"
                          : "border bg-slate-50 text-slate-800"
                      }`}
                    >
                      <p className="text-sm leading-6">{message.body}</p>
                      <p
                        className={`mt-1 text-xs font-bold ${
                          message.sender === "me" ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {dmTimeAgo(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="border-t p-4">
                <div className="flex gap-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={`Message ${activeThread.personName}...`}
                    className="min-w-0 flex-1 rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300"
                  />
                  <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500">No message thread selected.</div>
          )}
        </main>
      </section>
    </div>
  );
}
