import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Edit3, Plus, RefreshCw, Trash2 } from "lucide-react";
import { loadChatRooms, type ChatRoom } from "@/lib/chat-rooms-store";
import {
  clearRoomMessages,
  createChatRoom,
  deleteChatRoom,
  updateChatRoom,
  type RoomCategory,
} from "@/lib/room-admin-store";

const categories: RoomCategory[] = ["Academic", "Scholarships", "Study Abroad", "Programming", "Careers"];

export default function RoomsManagePage() {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => loadChatRooms());
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<RoomCategory>("Academic");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("💬");

  useEffect(() => {
    const sync = () => setRooms(loadChatRooms());
    window.addEventListener("collegediscourse-rooms-updated", sync);
    return () => window.removeEventListener("collegediscourse-rooms-updated", sync);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setCategory("Academic");
    setDescription("");
    setIcon("💬");
  };

  const startEdit = (room: ChatRoom) => {
    setEditingId(room.id);
    setName(room.name);
    setSlug(room.slug);
    setCategory(room.category);
    setDescription(room.description);
    setIcon(room.icon);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setRooms(updateChatRoom(editingId, { name, category, description, icon }));
    } else {
      setRooms(createChatRoom({ name, slug, category, description, icon }));
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">Room Management</p>
            <h1 className="mt-3 text-3xl font-black">Manage community chat rooms</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create, edit, reset, and organize CollegeDiscourse chat rooms.
            </p>
          </div>
          <Link href="/rooms" className="rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
            Open Rooms
          </Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={submit} className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-black">
            {editingId ? <Edit3 className="h-5 w-5 text-blue-700" /> : <Plus className="h-5 w-5 text-blue-700" />}
            {editingId ? "Edit Room" : "Create Room"}
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700">Room name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
                }}
                placeholder="Data Analysis"
                className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            {!editingId && (
              <div>
                <label className="text-sm font-bold text-slate-700">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="data-analysis"
                  className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RoomCategory)}
                className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Icon</label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📊"
                className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Room description..."
                rows={4}
                className="mt-2 w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="rounded-full bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900">
                {editingId ? "Save changes" : "Create room"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-full border px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <article key={room.id} className="min-w-0 rounded-3xl border bg-white p-5 shadow-sm">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-800 text-xl text-white">
                  {room.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black">{room.name}</h2>
                  <p className="truncate text-sm text-slate-500">/rooms/{room.slug} · {room.category}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{room.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{room.members} members</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">{room.online} online</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">{room.messages.length} messages</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/rooms/${room.slug}`} className="rounded-full border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                      Open
                    </Link>
                    <button onClick={() => startEdit(room)} className="rounded-full border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                      Edit
                    </button>
                    <button onClick={() => setRooms(clearRoomMessages(room.id))} className="inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                    <button onClick={() => setRooms(deleteChatRoom(room.id))} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
