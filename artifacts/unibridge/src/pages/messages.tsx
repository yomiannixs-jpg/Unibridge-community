import { useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, Send } from "lucide-react";
import {
  dmTimeAgo,
  loadDirectMessages,
  markThreadRead,
  resetDirectMessages,
  sendDirectMessage,
  type MessageThread,
} from "@/lib/direct-messages-store";
import { loadPresenceUsers } from "@/lib/presence-store";
import { PresenceBadge, PresenceDot } from "@/components/presence-badge";

function initials(name: string) {
  return (name || "U").charAt(0).toUpperCase();
}

function ThreadList({
  threads,
  selectedId,
  onSelect,
}: {
  threads: MessageThread[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const presenceUsers = loadPresenceUsers();

  return (
    <aside className="rounded-3xl border bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 px-2 font-black">
        <Inbox className="h-5 w-5 text-blue-700" />
        Direct Messages
      </div>

      <div className="space-y-2">
        {threads.map((thread) => {
          const presence = presenceUsers.find((u) => u.name === thread.participantName);
          const lastMessage = thread.messages[thread.messages.length - 1];

          return (
            <button
              key={thread.id}
              onClick={() => onSelect(thread.id)}
              className={`w-full rounded-2xl p-3 text-left transition ${
                selectedId === thread.id ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
                  {thread.participantAvatar || initials(thread.participantName)}
                  <span className="absolute -bottom-1 -right-1">
                    <PresenceDot status={presence?.status ?? "offline"} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <b className="truncate text-sm">{thread.participantName}</b>
                    <span className="shrink-0 text-xs text-slate-400">{dmTimeAgo(thread.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-blue-700">{thread.participantHandle}</p>
                  <p className="truncate text-xs text-slate-500">
                    {lastMessage ? lastMessage.body : thread.participantRole}
                  </p>
                  {presence?.typing ? <p className="text-xs font-bold text-emerald-700">typing...</p> : null}
                </div>

                {thread.unread ? (
                  <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white">{thread.unread}</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function Messages() {
  const [threads, setThreads] = useState<MessageThread[]>(() => loadDirectMessages());
  const [selectedId, setSelectedId] = useState(() => loadDirectMessages()[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => setThreads(loadDirectMessages());
    window.addEventListener("collegediscourse-dm-updated", sync);
    return () => window.removeEventListener("collegediscourse-dm-updated", sync);
  }, []);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? threads[0],
    [threads, selectedId],
  );

  const selectedPresence = selectedThread
    ? loadPresenceUsers().find((user) => user.name === selectedThread.participantName)
    : undefined;

  const openThread = (id: string) => {
    setSelectedId(id);
    setThreads(markThreadRead(id));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread) return;
    const next = sendDirectMessage(selectedThread.id, draft);
    setThreads(next);
    setDraft("");
  };

  const resetInbox = () => {
    const next = resetDirectMessages();
    setThreads(next);
    setSelectedId(next[0]?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black">Direct Messages</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Continue private conversations with mentors, contributors, and student helpers.
            </p>
          </div>
          <button
            onClick={resetInbox}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Reset demo inbox
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
        <ThreadList threads={threads} selectedId={selectedThread?.id ?? ""} onSelect={openThread} />

        <main className="rounded-3xl border bg-white shadow-sm">
          {selectedThread ? (
            <>
              <header className="border-b p-5">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800 font-black text-white">
                    {selectedThread.participantAvatar || initials(selectedThread.participantName)}
                    <span className="absolute -bottom-1 -right-1">
                      <PresenceDot status={selectedPresence?.status ?? "offline"} />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black">{selectedThread.participantName}</h2>
                    <p className="text-sm text-slate-500">
                      {selectedThread.participantHandle} · {selectedThread.participantRole}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <PresenceBadge status={selectedPresence?.status ?? "offline"} lastSeen={selectedPresence?.lastSeen} />
                      {selectedPresence?.typing ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                          typing...
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </header>

              <div className="max-h-[460px] space-y-3 overflow-y-auto p-5">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-3xl p-4 ${
                      message.sender === "You"
                        ? "ml-auto bg-blue-800 text-white"
                        : "border bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="text-xs font-black opacity-70">
                      {message.sender} · {dmTimeAgo(message.createdAt)}
                    </div>
                    <p className="mt-1 text-sm leading-6">{message.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="border-t p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${selectedThread.participantName}...`}
                    className="min-w-0 flex-1 rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
                  />
                  <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-10 text-center text-slate-500">No conversations yet.</div>
          )}
        </main>
      </section>
    </div>
  );
}
