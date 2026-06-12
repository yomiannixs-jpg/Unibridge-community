import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { Hash, Send, Users } from "lucide-react";
import { loadChatRooms, roomTimeAgo, sendRoomMessage, type ChatRoom } from "@/lib/chat-rooms-store";
import { loadPresenceUsers } from "@/lib/presence-store";
import { PresenceDot } from "@/components/presence-badge";

const categories = ["All", "Academic", "Scholarships", "Study Abroad", "Programming", "Careers"] as const;

function RoomCard({ room, active }: { room: ChatRoom; active: boolean }) {
  const lastMessage = room.messages[room.messages.length - 1];

  return (
    <Link
      href={`/rooms/${room.slug}`}
      className={`block rounded-3xl border bg-white p-4 text-left transition hover:border-blue-300 hover:shadow-md ${
        active ? "border-blue-300 bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800 text-xl text-white">
          {room.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-black">{room.name}</h3>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {room.category}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{room.description}</p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
            <span>{room.members} members</span>
            <span className="text-emerald-700">{room.online} online</span>
          </div>

          {lastMessage ? (
            <p className="mt-2 truncate text-xs text-slate-500">
              {lastMessage.author}: {lastMessage.body}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function RoomsPage() {
  const [, params] = useRoute("/rooms/:slug");
  const routeSlug = params?.slug;

  const [rooms, setRooms] = useState<ChatRoom[]>(() => loadChatRooms());
  const [selectedId, setSelectedId] = useState(() => {
    const loaded = loadChatRooms();
    const match = routeSlug ? loaded.find((room) => room.slug === routeSlug) : undefined;
    return match?.id ?? loaded[0]?.id ?? "";
  });
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [draft, setDraft] = useState("");

  const presenceUsers = loadPresenceUsers();

  useEffect(() => {
    const sync = () => setRooms(loadChatRooms());
    window.addEventListener("collegediscourse-rooms-updated", sync);
    return () => window.removeEventListener("collegediscourse-rooms-updated", sync);
  }, []);

  useEffect(() => {
    if (!routeSlug) return;
    const match = rooms.find((room) => room.slug === routeSlug);
    if (match) {
      setSelectedId(match.id);
      setCategory("All");
    }
  }, [routeSlug, rooms]);

  const filteredRooms = useMemo(
    () => (category === "All" ? rooms : rooms.filter((room) => room.category === category)),
    [rooms, category],
  );

  const selectedRoom = useMemo(() => {
    const routeMatch = routeSlug ? rooms.find((room) => room.slug === routeSlug) : undefined;
    return routeMatch ?? rooms.find((room) => room.id === selectedId) ?? filteredRooms[0] ?? rooms[0];
  }, [rooms, filteredRooms, selectedId, routeSlug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const next = sendRoomMessage(selectedRoom.id, draft);
    setRooms(next);
    setDraft("");
  };

  const typingUsers = presenceUsers.filter((user) => user.typing && user.currentRoom === selectedRoom?.name);

  return (
    <div className="space-y-6 overflow-hidden">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Hash className="h-8 w-8 text-blue-700" />
          <div>
            <h1 className="text-3xl font-black">Community Chat Rooms</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Join live-style room discussions for research help, scholarships, study abroad, programming, and careers.
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              category === item ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-3">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} active={selectedRoom?.id === room.id} />
          ))}
        </aside>

        <main className="min-w-0 rounded-3xl border bg-white shadow-sm">
          {selectedRoom ? (
            <>
              <header className="border-b p-5">
                <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black">
                      {selectedRoom.icon} {selectedRoom.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRoom.members} members · {selectedRoom.online} online · {selectedRoom.messages.length} messages
                    </p>
                    {typingUsers.length ? (
                      <p className="mt-2 text-xs font-bold text-emerald-700">
                        {typingUsers.map((u) => u.name).join(", ")} typing...
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(selectedRoom.onlineUsers ?? []).slice(0, 6).map((user) => {
                      const presence = presenceUsers.find((p) => p.name === user);
                      return (
                        <span key={user} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          <PresenceDot status={presence?.status ?? "online"} />
                          {user}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </header>

              <div className="max-h-[520px] space-y-3 overflow-y-auto p-5">
                {selectedRoom.messages.map((message) => {
                  const presence = presenceUsers.find((u) => u.name === message.author);
                  return (
                    <div key={message.id} className="rounded-3xl border bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <PresenceDot status={presence?.status ?? "offline"} />
                        <b className="text-sm text-slate-950">{message.author}</b>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">
                          {message.role}
                        </span>
                        <span className="text-xs text-slate-400">{roomTimeAgo(message.createdAt)}</span>
                      </div>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">{message.body}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submit} className="border-t p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${selectedRoom.name} room...`}
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
            <div className="p-10 text-center text-slate-500">Select a room to begin.</div>
          )}
        </main>
      </section>
    </div>
  );
}
