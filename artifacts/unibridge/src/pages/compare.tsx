import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListColleges, useGetCollege } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Plus, ArrowLeft, ArrowRight, MapPin, Users } from "lucide-react";

const MAX_COLLEGES = 3;

function StatBar({ value, max, className = "" }: { value: number | null | undefined; max: number; className?: string }) {
  if (value == null) return <div className="h-2 bg-muted rounded-full" />;
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CollegeSlot({
  collegeId,
  onRemove,
  onAdd,
  allCollegeIds,
  colorClass,
  barClass,
}: {
  collegeId: number | null;
  onRemove: () => void;
  onAdd: (id: number) => void;
  allCollegeIds: number[];
  colorClass: string;
  barClass: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: college } = useGetCollege(collegeId!, {
    query: { enabled: collegeId != null },
  });

  const { data: allColleges } = useListColleges();

  const filtered = useMemo(
    () =>
      (allColleges ?? []).filter(
        (c) =>
          !allCollegeIds.includes(c.id) &&
          c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [allColleges, allCollegeIds, search]
  );

  if (collegeId == null) {
    return (
      <div className="flex-1 min-w-0">
        <div
          className={`rounded-xl border-2 border-dashed border-border h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors relative`}
          onClick={() => setOpen((v) => !v)}
        >
          <Plus className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add college</span>
        </div>
        {open && (
          <div className="mt-2 border border-border rounded-xl bg-card shadow-lg z-10 relative overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search colleges..."
                  className="pl-8 h-8 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No colleges available</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex flex-col gap-0.5"
                    onClick={() => {
                      onAdd(c.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="font-medium leading-tight">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.location}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex-1 min-w-0">
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className={`rounded-xl border-2 ${colorClass} bg-card p-4 relative`}>
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onRemove}
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
        {college.color && (
          <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl" style={{ backgroundColor: college.color }} />
        )}
        <div className="pl-2">
          <h3 className="font-bold text-base leading-tight pr-6 line-clamp-2">{college.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" /> {college.location}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {college.type?.replace("_", " ")}
            </Badge>
            <Link
              href={`/colleges/${college.id}`}
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const SLOT_COLORS = [
  "border-blue-400/60",
  "border-blue-500/60",
  "border-purple-400/60",
];
const BAR_COLORS = [
  "bg-blue-500",
  "bg-blue-500",
  "bg-purple-500",
];

type StatRow = {
  label: string;
  key: keyof ReturnType<typeof buildStats>;
  format: (v: number | null | undefined) => string;
  max: number;
  suffix?: string;
};

function buildStats(college: NonNullable<ReturnType<typeof useGetCollege>["data"]>) {
  return {
    acceptanceRate: college.acceptanceRate,
    medianGpa: college.medianGpa,
    medianSat: college.medianSat,
    medianAct: college.medianAct,
    enrollment: college.enrollment,
    postCount: college.postCount,
    reviewCount: college.reviewCount,
  };
}

const STAT_ROWS: StatRow[] = [
  { label: "Acceptance Rate", key: "acceptanceRate", format: (v) => v != null ? `${v}%` : "N/A", max: 100 },
  { label: "Median GPA", key: "medianGpa", format: (v) => v != null ? v.toFixed(2) : "N/A", max: 4 },
  { label: "Median SAT", key: "medianSat", format: (v) => v != null ? v.toLocaleString() : "N/A", max: 1600 },
  { label: "Median ACT", key: "medianAct", format: (v) => v != null ? String(v) : "N/A", max: 36 },
  { label: "Enrollment", key: "enrollment", format: (v) => v != null ? v.toLocaleString() : "N/A", max: 50000 },
  { label: "Community Posts", key: "postCount", format: (v) => v != null ? String(v) : "0", max: 50 },
  { label: "Peer Reviews", key: "reviewCount", format: (v) => v != null ? String(v) : "0", max: 20 },
];

function CollegeStatCell({
  collegeId,
  statKey,
  format,
  max,
  barClass,
}: {
  collegeId: number | null;
  statKey: keyof ReturnType<typeof buildStats>;
  format: (v: number | null | undefined) => string;
  max: number;
  barClass: string;
}) {
  const { data: college } = useGetCollege(collegeId!, {
    query: { enabled: collegeId != null },
  });

  if (collegeId == null) {
    return (
      <td className="px-4 py-3 text-center">
        <span className="text-muted-foreground text-sm">—</span>
      </td>
    );
  }

  if (!college) {
    return (
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16 mx-auto" />
      </td>
    );
  }

  const stats = buildStats(college);
  const value = stats[statKey] as number | null | undefined;

  return (
    <td className="px-4 py-3">
      <div className="space-y-1">
        <div className="text-center font-semibold text-sm">{format(value)}</div>
        <StatBar value={value} max={max} className={barClass} />
      </div>
    </td>
  );
}

export default function Compare() {
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);

  const filledIds = slots.filter((s): s is number => s != null);

  const addCollege = (slotIndex: number, id: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = id;
      return next;
    });
  };

  const removeCollege = (slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const hasAny = filledIds.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <Link href="/colleges" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Colleges
        </Link>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Compare Colleges</h1>
        <p className="text-muted-foreground mt-1">Select up to {MAX_COLLEGES} colleges to compare side-by-side.</p>
      </div>

      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        {slots.map((id, i) => (
          <CollegeSlot
            key={i}
            collegeId={id}
            onRemove={() => removeCollege(i)}
            onAdd={(cid) => addCollege(i, cid)}
            allCollegeIds={filledIds}
            colorClass={SLOT_COLORS[i]}
            barClass={BAR_COLORS[i]}
          />
        ))}
      </div>

      {!hasAny ? (
        <div className="text-center py-20 border rounded-xl border-dashed">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Pick at least one college above to start comparing.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-36">Stat</th>
                  {slots.map((id, i) => {
                    if (id == null) return <th key={i} className="px-4 py-3 w-40" />;
                    return (
                      <CollegeHeaderCell key={i} collegeId={id} colorClass={SLOT_COLORS[i]} />
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {STAT_ROWS.map((row, ri) => (
                  <tr
                    key={row.key}
                    className={`border-b border-border/50 ${ri % 2 === 0 ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{row.label}</td>
                    {slots.map((id, i) => (
                      <CollegeStatCell
                        key={i}
                        collegeId={id}
                        statKey={row.key}
                        format={row.format}
                        max={row.max}
                        barClass={BAR_COLORS[i]}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CollegeHeaderCell({ collegeId, colorClass }: { collegeId: number; colorClass: string }) {
  const { data: college } = useGetCollege(collegeId);
  if (!college) return <th className="px-4 py-3 w-40"><Skeleton className="h-4 w-24" /></th>;
  return (
    <th className={`px-4 py-3 w-40`}>
      <div className={`text-left font-bold leading-tight border-l-4 pl-2 ${colorClass.replace("border-", "border-l-")}`}>
        {college.name}
      </div>
    </th>
  );
}
