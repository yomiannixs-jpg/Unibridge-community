export type AutoModerationSettings = {
  enabled: boolean;
  antiAgentMode: boolean;
  duplicateDetection: boolean;
  scamDetection: boolean;
  toxicityFilter: boolean;
  maxPostsPerHour: number;
  blockedWords: string[];
  flaggedPatterns: string[];
};

export type AutoModerationResult = {
  allowed: boolean;
  score: number;
  flags: string[];
  recommendation: "allow" | "review" | "block";
};

const STORAGE_KEY = "collegediscourse-auto-moderation-v1";

export const defaultAutoModerationSettings: AutoModerationSettings = {
  enabled: true,
  antiAgentMode: true,
  duplicateDetection: true,
  scamDetection: true,
  toxicityFilter: true,
  maxPostsPerHour: 5,
  blockedWords: ["guaranteed visa", "pay me", "agent fee", "100% scholarship", "whatsapp only"],
  flaggedPatterns: ["send money", "processing fee", "guaranteed admission", "dm me for scholarship"],
};

export function loadAutoModerationSettings(): AutoModerationSettings {
  if (typeof window === "undefined") return defaultAutoModerationSettings;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAutoModerationSettings;
  try {
    return { ...defaultAutoModerationSettings, ...JSON.parse(raw) };
  } catch {
    return defaultAutoModerationSettings;
  }
}

export function saveAutoModerationSettings(settings: AutoModerationSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("collegediscourse-auto-moderation-updated"));
}

export function evaluateContent(text: string, settings = loadAutoModerationSettings()): AutoModerationResult {
  if (!settings.enabled) return { allowed: true, score: 0, flags: [], recommendation: "allow" };

  const normalized = text.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  for (const word of settings.blockedWords) {
    if (word && normalized.includes(word.toLowerCase())) {
      flags.push(`Blocked phrase: ${word}`);
      score += 35;
    }
  }

  for (const pattern of settings.flaggedPatterns) {
    if (pattern && normalized.includes(pattern.toLowerCase())) {
      flags.push(`Flagged pattern: ${pattern}`);
      score += 25;
    }
  }

  if (settings.scamDetection && /(guaranteed|100%|instant).{0,25}(scholarship|visa|admission)/i.test(text)) {
    flags.push("Possible guarantee-based scam language");
    score += 30;
  }

  if (settings.antiAgentMode && /(agent|consultant|whatsapp|telegram).{0,35}(fee|payment|pay|dm)/i.test(text)) {
    flags.push("Possible paid-agent solicitation");
    score += 30;
  }

  if (settings.toxicityFilter && /(idiot|stupid|fool|shut up)/i.test(text)) {
    flags.push("Possible disrespectful language");
    score += 20;
  }

  const recommendation: AutoModerationResult["recommendation"] = score >= 70 ? "block" : score >= 30 ? "review" : "allow";
  return { allowed: recommendation !== "block", score, flags, recommendation };
}
