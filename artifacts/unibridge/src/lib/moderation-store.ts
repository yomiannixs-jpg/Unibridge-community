export type ModerationReport = {
  id: string;
  targetType: "post" | "comment" | "user" | "hub";
  targetId: string;
  title: string;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: string;
};

export type ModerationAction = {
  id: string;
  label: string;
  description: string;
  createdAt: string;
};

const REPORTS_KEY = "collegediscourse-moderation-reports-v1";
const ACTIONS_KEY = "collegediscourse-moderation-actions-v1";

const seedReports: ModerationReport[] = [
  {
    id: "r1",
    targetType: "post",
    targetId: "p1",
    title: "Verify scholarship link before pinning",
    reason: "Scholarship verification",
    details: "A funding opportunity was shared without a direct university or funder page. Please verify before promoting it.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "r2",
    targetType: "comment",
    targetId: "c2",
    title: "Possible paid-agent bait",
    reason: "Spam / solicitation",
    details: "A reply asks students to contact a private agent outside the platform.",
    status: "reviewing",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const seedActions: ModerationAction[] = [
  {
    id: "a1",
    label: "Scholarship verification checklist",
    description: "Require country, deadline, funder link, eligibility, award value, and official source.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "a2",
    label: "Clear title rule",
    description: "Encourage titles that mention country, degree level, topic, and deadline where relevant.",
    createdAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("collegediscourse-moderation-updated"));
}

export function loadReports() {
  return readJson<ModerationReport[]>(REPORTS_KEY, seedReports);
}

export function saveReports(reports: ModerationReport[]) {
  writeJson(REPORTS_KEY, reports);
}

export function loadActions() {
  return readJson<ModerationAction[]>(ACTIONS_KEY, seedActions);
}

export function saveActions(actions: ModerationAction[]) {
  writeJson(ACTIONS_KEY, actions);
}

export function createReport(input: Omit<ModerationReport, "id" | "status" | "createdAt">) {
  const reports = loadReports();
  const report: ModerationReport = {
    ...input,
    id: `r-${Date.now()}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  saveReports([report, ...reports]);
  return report;
}

export function updateReportStatus(id: string, status: ModerationReport["status"]) {
  const reports = loadReports().map((report) =>
    report.id === id ? { ...report, status } : report,
  );
  saveReports(reports);
  return reports;
}

export function clearResolvedReports() {
  const reports = loadReports().filter(
    (report) => report.status !== "resolved" && report.status !== "dismissed",
  );
  saveReports(reports);
  return reports;
}
