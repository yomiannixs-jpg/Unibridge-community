import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AtSign, Bell, CheckCheck, MessageCircle, Radio, Star, UserPlus } from "lucide-react";
import {
  loadNotificationHub,
  markAllHubNotificationsRead,
  markHubNotificationRead,
  notificationTimeAgo,
  type HubNotification,
} from "@/lib/notification-hub";

const typeIcon = {
  mention: AtSign,
  message: MessageCircle,
  follow: UserPlus,
  reputation: Star,
  room: Radio,
};

const filters = ["all", "unread", "mentions", "messages", "social", "reputation", "rooms"] as const;

function NotificationCard({
  item,
  onRead,
}: {
  item: HubNotification;
  onRead: (id: string) => void;
}) {
  const Icon = typeIcon[item.type];

  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${item.unread ? "border-blue-300" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.unread && <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white">NEW</span>}
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.type}</span>
            <span className="text-xs font-bold text-slate-400">{notificationTimeAgo(item.createdAt)}</span>
          </div>

          <Link href={item.href}>
            <h2 className="mt-3 text-lg font-black text-slate-950 hover:text-blue-700">{item.title}</h2>
          </Link>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
        </div>

        <button
          onClick={() => onRead(item.id)}
          className="shrink-0 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
        >
          {item.unread ? "Mark read" : "Read"}
        </button>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<HubNotification[]>(() => loadNotificationHub());
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  useEffect(() => {
    const sync = () => setItems(loadNotificationHub());
    window.addEventListener("collegediscourse-notification-hub-updated", sync);
    window.addEventListener("collegediscourse-mentions-updated", sync);
    window.addEventListener("collegediscourse-dm-updated", sync);
    window.addEventListener("collegediscourse-social-updated", sync);
    window.addEventListener("collegediscourse-rooms-updated", sync);

    return () => {
      window.removeEventListener("collegediscourse-notification-hub-updated", sync);
      window.removeEventListener("collegediscourse-mentions-updated", sync);
      window.removeEventListener("collegediscourse-dm-updated", sync);
      window.removeEventListener("collegediscourse-social-updated", sync);
      window.removeEventListener("collegediscourse-rooms-updated", sync);
    };
  }, []);

  const unreadCount = items.filter((item) => item.unread).length;

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((item) => item.unread);
    if (filter === "mentions") return items.filter((item) => item.type === "mention");
    if (filter === "messages") return items.filter((item) => item.type === "message");
    if (filter === "social") return items.filter((item) => item.type === "follow");
    if (filter === "reputation") return items.filter((item) => item.type === "reputation");
    if (filter === "rooms") return items.filter((item) => item.type === "room");
    return items;
  }, [items, filter]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-700">
              <Bell className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Notification Center</span>
            </div>
            <h1 className="mt-3 text-3xl font-black">Your live activity feed</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Mentions, direct messages, follows, reputation changes, and active rooms are collected here.
            </p>
          </div>

          <div className="rounded-3xl bg-blue-50 px-5 py-4 text-center">
            <p className="text-sm font-bold text-blue-800">Unread</p>
            <p className="text-3xl font-black text-blue-950">{unreadCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  filter === item ? "bg-blue-800 text-white" : "border bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item === "all" ? "All" : item === "unread" ? "Unread" : item}
              </button>
            ))}
          </div>

          <button
            onClick={() => setItems(markAllHubNotificationsRead())}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </section>

      <section className="grid gap-4">
        {visible.length ? (
          visible.map((item) => (
            <NotificationCard key={item.id} item={item} onRead={(id) => setItems(markHubNotificationRead(id))} />
          ))
        ) : (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500 shadow-sm">
            No notifications in this category.
          </div>
        )}
      </section>
    </div>
  );
}
