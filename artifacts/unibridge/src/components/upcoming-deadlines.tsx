import { useMemo } from "react";
import { Link } from "wouter";
import { useListApplications, useListChecklistItems } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, AlarmClock, ClipboardList, CheckSquare, ArrowRight } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";

type DeadlineItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  href: string;
  accentColor?: string | null;
  emoji?: string;
  daysUntil: number;
};

function urgencyStyle(days: number) {
  if (days < 0)  return { badge: "bg-red-100 text-red-700 border-red-200",   label: "Overdue",       dot: "bg-red-500" };
  if (days === 0) return { badge: "bg-red-100 text-red-700 border-red-200",   label: "Today",         dot: "bg-red-500" };
  if (days === 1) return { badge: "bg-blue-100 text-blue-800 border-blue-200", label: "Tomorrow", dot: "bg-blue-500" };
  if (days <= 3)  return { badge: "bg-blue-100 text-blue-800 border-blue-200", label: `${days}d`, dot: "bg-blue-500" };
  if (days <= 7)  return { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", label: `${days}d`, dot: "bg-yellow-500" };
  if (days <= 30) return { badge: "bg-blue-100 text-blue-700 border-blue-200",  label: `${days}d`,    dot: "bg-blue-400" };
  return          { badge: "bg-muted text-muted-foreground border-border",      label: `${days}d`,    dot: "bg-muted-foreground" };
}

const CATEGORY_EMOJIS: Record<string, string> = {
  essays: "✍️", testing: "📊", recommendations: "📝",
  activities: "🏆", applications: "📋", financial_aid: "💰", other: "📌",
};

export function UpcomingDeadlines() {
  const { userId } = useAuth();

  const { data: applications = [], isLoading: isLoadingApps } = useListApplications({ userId });
  const { data: checklistItems = [], isLoading: isLoadingChecklist } = useListChecklistItems({ userId });

  const isLoading = isLoadingApps || isLoadingChecklist;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const deadlines = useMemo<DeadlineItem[]>(() => {
    const items: DeadlineItem[] = [];

    // Applications with deadlines
    for (const app of applications as any[]) {
      if (!app.deadline) continue;
      const days = differenceInCalendarDays(parseISO(app.deadline), today);
      if (days > 60) continue; // only show within 60 days
      items.push({
        id: `app-${app.id}`,
        title: app.collegeName ?? "College",
        subtitle: "Application deadline",
        date: app.deadline,
        href: "/tracker",
        accentColor: app.collegeColor,
        daysUntil: days,
      });
    }

    // Checklist items with due dates (not completed)
    for (const item of checklistItems as any[]) {
      if (!item.dueDate || item.completed) continue;
      const days = differenceInCalendarDays(parseISO(item.dueDate), today);
      if (days > 60) continue;
      items.push({
        id: `check-${item.id}`,
        title: item.title,
        subtitle: item.category ? (item.category.replace("_", " ")) : "Checklist",
        date: item.dueDate,
        href: "/checklist",
        emoji: CATEGORY_EMOJIS[item.category] ?? "📌",
        daysUntil: days,
      });
    }

    return items.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 6);
  }, [applications, checklistItems, today]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif">Upcoming Deadlines</h2>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-serif flex items-center gap-2">
          <AlarmClock className="w-5 h-5 text-primary" />
          Upcoming Deadlines
        </h2>
      </div>

      {deadlines.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-5 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No deadlines set yet.</p>
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <Link href="/tracker" className="flex items-center justify-center gap-1.5 hover:text-primary transition-colors">
              <ClipboardList className="w-3.5 h-3.5" /> Add deadlines in My List
            </Link>
            <Link href="/checklist" className="flex items-center justify-center gap-1.5 hover:text-primary transition-colors">
              <CheckSquare className="w-3.5 h-3.5" /> Set due dates in Checklist
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {deadlines.map((item) => {
            const { badge, label, dot } = urgencyStyle(item.daysUntil);
            return (
              <Link key={item.id} href={item.href}>
                <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group">
                  {/* Color accent or emoji */}
                  {item.accentColor ? (
                    <div className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: item.accentColor }} />
                  ) : (
                    <span className="text-base shrink-0 w-5 text-center">{item.emoji}</span>
                  )}

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">{item.subtitle}</p>
                  </div>

                  {/* Countdown badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge}`}>
                      {label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}

          {deadlines.length >= 6 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              Showing nearest 6 deadlines
            </p>
          )}
        </div>
      )}
    </div>
  );
}
