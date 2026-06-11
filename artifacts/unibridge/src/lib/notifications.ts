export type NotificationType = "reply" | "comment" | "vote" | "save" | "hub" | "system";

export type CollegeDiscourseNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
};

const NOTIFICATIONS_KEY = "collegediscourse-notifications-v1";
const NOTIFICATION_EVENT = "collegediscourse-notifications-updated";

const seedNotifications: CollegeDiscourseNotification[] = [
  {
    id: "n_seed_1",
    type: "reply",
    title: "New scholarship discussion",
    message: "A mentor replied in d/scholarships with deadline advice.",
    href: "/d/scholarships",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "n_seed_2",
    type: "hub",
    title: "Research Help is trending",
    message: "7 research methods discussions are active today.",
    href: "/d/research-help",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: "n_seed_3",
    type: "system",
    title: "Welcome to CollegeDiscourse",
    message: "Follow Hubs, save posts, and join discussions to build your academic network.",
    href: "/profile",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

function emitNotificationUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
  }
}

export function readNotifications(): CollegeDiscourseNotification[] {
  if (typeof window === "undefined") return seedNotifications;
  const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
  if (!raw) {
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(seedNotifications));
    return seedNotifications;
  }
  try {
    const parsed = JSON.parse(raw) as CollegeDiscourseNotification[];
    return Array.isArray(parsed) ? parsed : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

export function writeNotifications(notifications: CollegeDiscourseNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  emitNotificationUpdate();
}

export function unreadNotificationCount() {
  return readNotifications().filter((notification) => !notification.read).length;
}

export function addNotification(input: Omit<CollegeDiscourseNotification, "id" | "read" | "createdAt">) {
  const notification: CollegeDiscourseNotification = {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  writeNotifications([notification, ...readNotifications()].slice(0, 50));
  return notification;
}

export function markNotificationRead(id: string) {
  writeNotifications(readNotifications().map((notification) => (
    notification.id === id ? { ...notification, read: true } : notification
  )));
}

export function markAllNotificationsRead() {
  writeNotifications(readNotifications().map((notification) => ({ ...notification, read: true })));
}

export function clearAllNotifications() {
  writeNotifications([]);
}

export function notificationTimeAgo(input: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(input).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export { NOTIFICATION_EVENT };
