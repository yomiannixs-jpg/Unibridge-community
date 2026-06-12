import { loadMentions } from "@/lib/mentions-store";
import { loadDirectMessages } from "@/lib/direct-messages-store";
import { loadSocialStore } from "@/lib/social-store";
import { loadReputationStore } from "@/lib/reputation-store";
import { loadChatRooms } from "@/lib/chat-rooms-store";

export type HubNotification = {
  id: string;
  type: "mention" | "message" | "follow" | "reputation" | "room";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  unread: boolean;
};

const HUB_READ_KEY = "collegediscourse-notification-hub-read-v1";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(HUB_READ_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HUB_READ_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new Event("collegediscourse-notification-hub-updated"));
}

export function loadNotificationHub(): HubNotification[] {
  const read = new Set(readIds());

  const mentions = loadMentions().slice(0, 5).map((mention) => ({
    id: `mention-${mention.id}`,
    type: "mention" as const,
    title: "You were mentioned",
    body: mention.body,
    href: "/mentions",
    createdAt: mention.createdAt,
    unread: !mention.read && !read.has(`mention-${mention.id}`),
  }));

  const messages = loadDirectMessages()
    .filter((thread) => thread.unread > 0)
    .map((thread) => ({
      id: `message-${thread.id}`,
      type: "message" as const,
      title: `New message from ${thread.participantName}`,
      body: `${thread.unread} unread message${thread.unread > 1 ? "s" : ""}`,
      href: "/messages",
      createdAt: thread.lastMessageAt,
      unread: !read.has(`message-${thread.id}`),
    }));

  const social = loadSocialStore();
  const follows = social.activities
    .filter((item) => item.type === "follow" || item.type === "follower")
    .slice(0, 4)
    .map((item) => ({
      id: `social-${item.id}`,
      type: "follow" as const,
      title: item.label,
      body: item.detail,
      href: item.type === "follower" ? "/followers" : "/following",
      createdAt: item.createdAt,
      unread: !read.has(`social-${item.id}`),
    }));

  const reputation = loadReputationStore().activity?.slice(0, 4).map((item) => ({
    id: `rep-${item.id}`,
    type: "reputation" as const,
    title: "Reputation update",
    body: `${item.points > 0 ? "+" : ""}${item.points} · ${item.label}`,
    href: "/reputation",
    createdAt: item.createdAt,
    unread: !read.has(`rep-${item.id}`),
  })) ?? [];

  const rooms = loadChatRooms().slice(0, 3).map((room) => ({
    id: `room-${room.id}`,
    type: "room" as const,
    title: `${room.name} room is active`,
    body: `${room.online} online · ${room.messages.length} messages`,
    href: `/rooms/${room.slug}`,
    createdAt: room.messages[room.messages.length - 1]?.createdAt ?? new Date().toISOString(),
    unread: !read.has(`room-${room.id}`),
  }));

  return [...messages, ...mentions, ...follows, ...reputation, ...rooms].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function markHubNotificationRead(id: string) {
  saveReadIds([...readIds(), id]);
  return loadNotificationHub();
}

export function markAllHubNotificationsRead() {
  saveReadIds(loadNotificationHub().map((item) => item.id));
  return loadNotificationHub();
}

export function clearHubNotificationReadState() {
  saveReadIds([]);
  return loadNotificationHub();
}

export function notificationTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
