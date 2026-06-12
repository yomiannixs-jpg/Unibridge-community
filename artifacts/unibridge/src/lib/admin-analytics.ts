import { loadStore } from "@/lib/community-store";
import { loadModerationStore } from "@/lib/moderation-store";
import { loadModerationUsers } from "@/lib/moderation-users";
import { loadAutoModerationSettings } from "@/lib/auto-moderation";

export type HubAnalyticsRow = {
  slug: string;
  name: string;
  members: number;
  posts: number;
  reports: number;
  risk: "Low" | "Medium" | "High";
};

export type AdminAnalytics = {
  totalUsers: number;
  activeUsers: number;
  totalHubs: number;
  totalPosts: number;
  totalComments: number;
  openReports: number;
  resolvedReports: number;
  activeModerators: number;
  bannedUsers: number;
  mutedUsers: number;
  safetyScore: number;
  autoModerationEnabled: boolean;
  hubRows: HubAnalyticsRow[];
};

export function loadAdminAnalytics(): AdminAnalytics {
  const store = loadStore();
  const moderation = loadModerationStore();
  const users = loadModerationUsers();
  const auto = loadAutoModerationSettings();

  const communities = store.communities ?? [];
  const posts = store.posts ?? [];
  const comments = store.comments ?? [];
  const reports = moderation.reports ?? [];
  const moderators = moderation.moderators ?? [];

  const openReports = reports.filter((r) => r.status === "open" || r.status === "reviewing").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved" || r.status === "dismissed").length;
  const bannedUsers = users.filter((u) => u.status === "Banned").length;
  const mutedUsers = users.filter((u) => u.status === "Muted").length;

  const hubRows: HubAnalyticsRow[] = communities.map((hub) => {
    const hubPosts = posts.filter((post) => post.communitySlug === hub.slug).length;
    const hubReports = reports.filter((report) => report.hubSlug === hub.slug).length;
    const risk = hubReports >= 5 ? "High" : hubReports >= 2 ? "Medium" : "Low";
    return {
      slug: hub.slug,
      name: hub.name,
      members: hub.members,
      posts: hubPosts || 0,
      reports: hubReports,
      risk,
    };
  });

  const safetyScore = Math.max(45, 100 - openReports * 8 - bannedUsers * 5 - mutedUsers * 3);

  return {
    totalUsers: Math.max(users.length, 5),
    activeUsers: users.filter((u) => u.status === "Active").length || 4,
    totalHubs: communities.length,
    totalPosts: posts.length,
    totalComments: comments.length,
    openReports,
    resolvedReports,
    activeModerators: moderators.filter((m) => m.active).length,
    bannedUsers,
    mutedUsers,
    safetyScore,
    autoModerationEnabled: auto.enabled,
    hubRows,
  };
}
