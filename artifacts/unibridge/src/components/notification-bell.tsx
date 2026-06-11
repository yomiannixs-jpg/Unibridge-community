import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  useGetUnreadCount,
  useListNotifications,
  useMarkAllRead,
  useMarkNotificationRead,
  getGetUnreadCountQueryKey,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBell() {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: unreadData } = useGetUnreadCount(
    { userId },
    {
      query: {
        queryKey: getGetUnreadCountQueryKey({ userId }),
        refetchInterval: 15000,
        enabled: !!userId,
      },
    }
  );

  const { data: notifications, isLoading } = useListNotifications(
    { userId },
    {
      query: {
        queryKey: getListNotificationsQueryKey({ userId }),
        enabled: open && !!userId,
      },
    }
  );

  const markAllRead = useMarkAllRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUnreadCountQueryKey({ userId }) });
        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey({ userId }) });
      },
    },
  });

  const markOneRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUnreadCountQueryKey({ userId }) });
        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey({ userId }) });
      },
    },
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = unreadData?.count ?? 0;

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleMarkAllRead() {
    markAllRead.mutate({ data: { userId } });
  }

  function handleClickNotification(id: number, read: boolean) {
    if (!read) {
      markOneRead.mutate({ id });
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No notifications yet. When someone likes or comments on your posts, you'll see it here.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.postId ? `/posts/${n.postId}` : "/"}
                  onClick={() => handleClickNotification(n.id, n.read)}
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                    {(n.actorDisplayName ?? n.actorUsername ?? "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-medium">{n.actorDisplayName ?? n.actorUsername}</span>
                      {n.type === "like" ? " liked" : " commented on"} your post
                      {n.postTitle && (
                        <span className="text-muted-foreground"> &ldquo;{n.postTitle.slice(0, 40)}{n.postTitle.length > 40 ? "..." : ""}&rdquo;</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
