export type PrivacySettings = {
  profileVisibility: "public" | "members" | "private";
  showReputation: boolean;
  showJoinedHubs: boolean;
  showSavedPosts: boolean;
  showActivityHistory: boolean;
  allowDirectMessages: boolean;
  emailNotifications: boolean;
  replyNotifications: boolean;
  mentionNotifications: boolean;
  digestFrequency: "never" | "daily" | "weekly";
};

const STORAGE_KEY = "collegediscourse-privacy-settings-v1";

export const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: "public",
  showReputation: true,
  showJoinedHubs: true,
  showSavedPosts: false,
  showActivityHistory: true,
  allowDirectMessages: true,
  emailNotifications: false,
  replyNotifications: true,
  mentionNotifications: true,
  digestFrequency: "weekly",
};

export function loadPrivacySettings(): PrivacySettings {
  if (typeof window === "undefined") return defaultPrivacySettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultPrivacySettings;
  try {
    return { ...defaultPrivacySettings, ...(JSON.parse(raw) as Partial<PrivacySettings>) };
  } catch {
    return defaultPrivacySettings;
  }
}

export function savePrivacySettings(settings: PrivacySettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("collegediscourse-privacy-updated"));
}

export function resetPrivacySettings() {
  savePrivacySettings(defaultPrivacySettings);
}
