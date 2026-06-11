import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  NOTIFICATION_EVENT,
  clearAllNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTimeAgo,
  readNotifications,
  type CollegeDiscourseNotification,
} from "@/lib/notifications";

function badgeClass(type: CollegeDiscourseNotification["type"]) {
  if (type === "reply" || type === "comment") return "bg-blue-100 text-blue-800";
  if (type === "vote") return "bg-emerald-100 text-emerald-800";
  if (type === "save") return "bg-purple-100 text-purple-800";
  if (type === "hub") return "bg-cyan-100 text-cyan-800";
  return "bg-slate-100 text-slate-700";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(readNotifications());

  useEffect(() => {
    const sync = () => setNotifications(readNotifications());
    window.addEventListener(NOTIFICATION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const unread = notifications.filter((notification) => !notification.read).length;

  const markAll = () => {
    markAllNotificationsRead();
    setNotifications(readNotifications());
  };

  const clear = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">CollegeDiscourse Alerts</p>
            <h1 className="mt-2 text-3xl font-black">Notification center</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track replies, votes, saved-post activity, and new activity in your joined SubDiscourses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={markAll} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:bg-blue-50 hover:text-blue-700">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
            <button onClick={clear} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold hover:bg-red-50 hover:text-red-700">
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <Bell className="mb-3 h-6 w-6 text-blue-700" />
          <p className="text-sm text-slate-500">Unread</p>
          <h2 className="text-3xl font-black">{unread}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total alerts</p>
          <h2 className="text-3xl font-black">{notifications.length}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <h2 className="text-xl font-black">Local + API-ready</h2>
        </div>
      </div>

      <section className="rounded-[2rem] border bg-white p-4 shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No notifications yet.</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => {
                  markNotificationRead(notification.id);
                  setNotifications(readNotifications());
                }}
                className={`block rounded-3xl border p-4 transition hover:border-blue-300 hover:bg-blue-50/40 ${!notification.read ? "border-blue-200 bg-blue-50/60" : "bg-white"}`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${badgeClass(notification.type)}`}>{notification.type}</span>
                      {!notification.read && <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-black text-red-700">Unread</span>}
                    </div>
                    <h2 className="mt-3 text-lg font-black text-slate-950">{notification.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-slate-400">{notificationTimeAgo(notification.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
