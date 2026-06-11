import { useState } from "react";
import { Link } from "wouter";
import {
  useListApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
  useListColleges,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  GraduationCap,
  X,
  CalendarDays,
  StickyNote,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const STATUSES = [
  { key: "planning", label: "Planning", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { key: "applying", label: "Applying", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { key: "applied", label: "Applied", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { key: "waitlisted", label: "Waitlisted", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { key: "deferred", label: "Deferred", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { key: "accepted", label: "Accepted", color: "bg-green-100 text-green-700 border-green-300" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

type StatusKey = (typeof STATUSES)[number]["key"];

function statusMeta(key: string) {
  return STATUSES.find((s) => s.key === key) ?? STATUSES[0];
}

type Application = {
  id: number;
  userId: number;
  collegeId: number;
  collegeName?: string;
  collegeLocation?: string;
  collegeColor?: string | null;
  collegeAcceptanceRate?: number;
  status: string;
  notes?: string | null;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
};

function AddCollegeModal({
  onClose,
  userId,
  existingCollegeIds,
}: {
  onClose: () => void;
  userId: number;
  existingCollegeIds: number[];
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>("planning");
  const [deadline, setDeadline] = useState("");
  const { data: allColleges } = useListColleges();
  const queryClient = useQueryClient();
  const create = useCreateApplication();

  const filtered = (allColleges ?? []).filter(
    (c) =>
      !existingCollegeIds.includes(c.id) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (collegeId: number) => {
    await create.mutateAsync({
      data: {
        userId,
        collegeId,
        status: selectedStatus,
        deadline: deadline || undefined,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-lg">Add a College</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Initial Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSelectedStatus(s.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                    selectedStatus === s.key
                      ? s.color + " ring-2 ring-offset-1 ring-primary/40"
                      : "bg-muted/50 text-muted-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Deadline (optional)</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Search Colleges</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No colleges available</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center justify-between gap-3"
                  onClick={() => handleAdd(c.id)}
                  disabled={create.isPending}
                >
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.location} · {c.acceptanceRate}% acceptance
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({
  current,
  appId,
  onUpdate,
}: {
  current: string;
  appId: number;
  onUpdate: (id: number, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = statusMeta(current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${meta.color}`}
      >
        {meta.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-36">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors flex items-center gap-2 ${
                s.key === current ? "opacity-50" : ""
              }`}
              onClick={() => {
                onUpdate(appId, s.key);
                setOpen(false);
              }}
              disabled={s.key === current}
            >
              <span className={`w-2 h-2 rounded-full border ${s.color}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesEditor({
  appId,
  notes,
  onUpdate,
}: {
  appId: number;
  notes: string | null | undefined;
  onUpdate: (id: number, notes: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");

  if (editing) {
    return (
      <div className="mt-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full text-xs border border-border rounded-lg p-2 bg-muted/50 resize-none outline-none focus:ring-1 focus:ring-primary"
          rows={2}
          autoFocus
          placeholder="Add notes..."
          onBlur={() => {
            onUpdate(appId, value);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group w-full text-left"
    >
      <StickyNote className="w-3 h-3 mt-0.5 shrink-0 group-hover:text-primary" />
      <span className="line-clamp-2">{notes || "Add notes..."}</span>
    </button>
  );
}

function AppCard({
  app,
  onUpdate,
  onDelete,
}: {
  app: Application;
  onUpdate: (id: number, patch: { status?: string; notes?: string; deadline?: string }) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all">
      {app.collegeColor && (
        <div className="h-1 w-full" style={{ backgroundColor: app.collegeColor }} />
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <Link
              href={`/colleges/${app.collegeId}`}
              className="font-bold text-sm leading-tight hover:text-primary transition-colors line-clamp-1"
            >
              {app.collegeName}
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" /> {app.collegeLocation}
            </div>
          </div>
          <button
            onClick={() => onDelete(app.id)}
            className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusDropdown
            current={app.status}
            appId={app.id}
            onUpdate={(id, status) => onUpdate(id, { status })}
          />
          {app.collegeAcceptanceRate != null && (
            <span className="text-xs text-muted-foreground">{app.collegeAcceptanceRate}% accept.</span>
          )}
        </div>

        {app.deadline && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span>Due {app.deadline}</span>
          </div>
        )}

        <NotesEditor
          appId={app.id}
          notes={app.notes}
          onUpdate={(id, notes) => onUpdate(id, { notes })}
        />
      </CardContent>
    </Card>
  );
}

export default function Tracker() {
  const { userId } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"board" | "list">("board");
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useListApplications({ userId });
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const handleUpdate = async (id: number, patch: { status?: string; notes?: string; deadline?: string }) => {
    await updateMutation.mutateAsync({ id, data: patch });
    queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
  };

  const existingCollegeIds = (applications as Application[]).map((a) => a.collegeId);

  const grouped = STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = (applications as Application[]).filter((a) => a.status === s.key);
      return acc;
    },
    {} as Record<string, Application[]>
  );

  const acceptedCount = grouped["accepted"]?.length ?? 0;
  const appliedCount = (applications as Application[]).filter(
    (a) => ["applied", "waitlisted", "accepted", "rejected", "deferred"].includes(a.status)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">My College List</h1>
          <p className="text-muted-foreground mt-1">Track your applications from research to decision.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/30">
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === "board" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === "list" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              List
            </button>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add College
          </Button>
        </div>
      </div>

      {(applications as Application[]).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{(applications as Application[]).length}</div>
            <div className="text-xs text-muted-foreground mt-1">Colleges Tracked</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{appliedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Applications Sent</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Acceptances</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (applications as Application[]).length === 0 ? (
        <div className="text-center py-24 border rounded-2xl border-dashed">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Your college list is empty</h3>
          <p className="text-muted-foreground text-sm mb-6">Start adding colleges to track your applications.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Your First College
          </Button>
        </div>
      ) : view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {STATUSES.filter((s) => grouped[s.key]?.length > 0).map((s) => (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground">{grouped[s.key].length}</span>
              </div>
              <div className="space-y-3">
                {grouped[s.key].map((app) => (
                  <AppCard key={app.id} app={app} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {STATUSES.map(
            (s) =>
              grouped[s.key]?.length > 0 && (
                <div key={s.key}>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mb-2 border ${s.color}`}>
                    {s.label} · {grouped[s.key].length}
                  </div>
                  <div className="space-y-2">
                    {grouped[s.key].map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3 hover-elevate"
                      >
                        {app.collegeColor && (
                          <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: app.collegeColor }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/colleges/${app.collegeId}`}
                            className="font-semibold text-sm hover:text-primary transition-colors"
                          >
                            {app.collegeName}
                          </Link>
                          <div className="text-xs text-muted-foreground">{app.collegeLocation}</div>
                        </div>
                        {app.deadline && (
                          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {app.deadline}
                          </div>
                        )}
                        <StatusDropdown
                          current={app.status}
                          appId={app.id}
                          onUpdate={(id, status) => handleUpdate(id, { status })}
                        />
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {showAdd && (
        <AddCollegeModal
          onClose={() => setShowAdd(false)}
          userId={userId}
          existingCollegeIds={existingCollegeIds}
        />
      )}
    </div>
  );
}
