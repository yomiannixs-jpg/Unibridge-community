import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Link } from "wouter";
import {
  NOTIFICATION_EVENT,
  clearAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTimeAgo,
  readNotifications,
  type CollegeDiscourseNotification,
} from "@/lib/notifications";

function notificationTone(type: CollegeDiscourseNotification["type"]) {
  if (type === "reply" || type === "comment") return "bg-blue-100 text-blue-800";
  if (type === "vote") return "bg-emerald-100 text-emerald-800";
  if (type === "save") return "bg-purple-100 text-purple-800";
  if (type === "hub") return "bg-cyan-100 text-cyan-800";
  return "bg-slate-100 text-slate-700";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(readNotifications());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setNotifications(readNotifications());
    window.addEventListener(NOTIFICATION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unread = notifications.filter((notification) => !notification.read).length;

  const markAll = () => {
    markAllNotificationsRead();
    setNotifications(readNotifications());
  };

  const clear = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const markOne = (id: string) => {
    markNotificationRead(id);
    setNotifications(readNotifications());
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full border bg-white p-2 text-slate-600 hover:text-slate-950"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[22rem] overflow-hidden rounded-3xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Notifications</p>
              <p className="text-xs text-slate-500">Replies, votes, saved posts, and Hub alerts</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markAll} className="rounded-full p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" title="Mark all read">
                <CheckCheck className="h-4 w-4" />
              </button>
              <button onClick={clear} className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" title="Clear notifications">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No notifications yet. Replies, mentions, saved-post updates, and Hub activity will appear here.
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => markOne(notification.id)}
                  className={`block rounded-2xl p-3 transition hover:bg-slate-50 ${!notification.read ? "bg-blue-50/70" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${notificationTone(notification.type)}`}>
                      {notification.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-slate-950">{notification.title}</p>
                        {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-700" />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-[11px] font-bold text-slate-400">{notificationTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t p-3">
            <Link href="/notifications" onClick={() => setOpen(false)} className="block rounded-full bg-slate-950 px-4 py-2 text-center text-xs font-black text-white hover:bg-blue-800">
              View notification center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
