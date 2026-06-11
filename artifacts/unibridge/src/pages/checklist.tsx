import { useState, useRef } from "react";
import {
  useListChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useLoadChecklistTemplate,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  StickyNote,
  X,
} from "lucide-react";

type Category = "essays" | "testing" | "recommendations" | "activities" | "applications" | "financial_aid" | "other";

const CATEGORIES: { key: Category; label: string; color: string; emoji: string }[] = [
  { key: "essays",          label: "Essays",          color: "bg-purple-100 text-purple-700 border-purple-200", emoji: "✍️" },
  { key: "testing",         label: "Test Scores",     color: "bg-blue-100 text-blue-700 border-blue-200",       emoji: "📊" },
  { key: "recommendations", label: "Recommendations", color: "bg-teal-100 text-teal-700 border-teal-200",       emoji: "📝" },
  { key: "activities",      label: "Activities",      color: "bg-blue-100 text-blue-800 border-blue-200", emoji: "🏆" },
  { key: "applications",    label: "Applications",    color: "bg-red-100 text-red-700 border-red-200",           emoji: "📋" },
  { key: "financial_aid",   label: "Financial Aid",   color: "bg-green-100 text-green-700 border-green-200",    emoji: "💰" },
  { key: "other",           label: "Other",           color: "bg-slate-100 text-slate-600 border-slate-200",    emoji: "📌" },
];

function categoryMeta(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

type Item = {
  id: number;
  userId: number;
  title: string;
  category: string;
  completed: boolean;
  dueDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

function ChecklistRow({
  item,
  onToggle,
  onDelete,
  onUpdate,
}: {
  item: Item;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, patch: Partial<{ title: string; dueDate: string; notes: string }>) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(item.title);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState(item.notes ?? "");
  const [editingDate, setEditingDate] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const commitTitle = () => {
    const trimmed = titleVal.trim();
    if (trimmed && trimmed !== item.title) onUpdate(item.id, { title: trimmed });
    else setTitleVal(item.title);
    setEditingTitle(false);
  };

  const commitNotes = () => {
    if (notesVal !== (item.notes ?? "")) onUpdate(item.id, { notes: notesVal });
    setEditingNotes(false);
  };

  return (
    <div className={`group flex flex-col gap-1.5 px-4 py-3 rounded-xl border transition-all ${item.completed ? "bg-muted/30 border-border/50 opacity-70" : "bg-card border-border hover:border-primary/30"}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item.id, !item.completed)}
          className={`mt-0.5 shrink-0 transition-colors ${item.completed ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          {item.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") { setTitleVal(item.title); setEditingTitle(false); }
              }}
              className="w-full text-sm bg-transparent outline-none border-b border-primary"
              autoFocus
            />
          ) : (
            <p
              className={`text-sm cursor-text leading-snug ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
              onClick={() => setEditingTitle(true)}
            >
              {item.title}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {item.dueDate && !editingDate && (
              <button
                onClick={() => setEditingDate(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CalendarDays className="w-3 h-3" />
                {item.dueDate}
                <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { dueDate: "" }); }} />
              </button>
            )}
            {editingDate && (
              <input
                type="date"
                value={item.dueDate ?? ""}
                onChange={(e) => { onUpdate(item.id, { dueDate: e.target.value }); setEditingDate(false); }}
                onBlur={() => setEditingDate(false)}
                className="text-xs border border-border rounded px-1 py-0.5 bg-background outline-none"
                autoFocus
              />
            )}
            {!item.dueDate && !editingDate && (
              <button
                onClick={() => setEditingDate(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
              >
                <CalendarDays className="w-3 h-3" /> Add date
              </button>
            )}
          </div>

          {editingNotes ? (
            <textarea
              value={notesVal}
              onChange={(e) => setNotesVal(e.target.value)}
              onBlur={commitNotes}
              rows={2}
              placeholder="Add a note..."
              className="w-full mt-1.5 text-xs bg-muted/50 border border-border rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          ) : (
            item.notes ? (
              <p
                onClick={() => setEditingNotes(true)}
                className="mt-1 text-xs text-muted-foreground cursor-text italic leading-relaxed"
              >
                {item.notes}
              </p>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
              >
                <StickyNote className="w-3 h-3" /> Add note
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function CategorySection({
  cat,
  items,
  onToggle,
  onDelete,
  onUpdate,
  onAdd,
}: {
  cat: (typeof CATEGORIES)[number];
  items: Item[];
  onToggle: (id: number, v: boolean) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, patch: Partial<{ title: string; dueDate: string; notes: string }>) => void;
  onAdd: (title: string, category: Category) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const done = items.filter((i) => i.completed).length;
  const total = items.length;

  const commitAdd = () => {
    const t = newTitle.trim();
    if (t) { onAdd(t, cat.key); setNewTitle(""); }
    setAdding(false);
  };

  return (
    <section>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-3 py-2 text-left group/header"
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        <span className="text-base">{cat.emoji}</span>
        <span className="font-semibold text-sm">{cat.label}</span>
        <Badge variant="outline" className={`text-xs ml-1 border ${cat.color}`}>
          {done}/{total}
        </Badge>
        {total > 0 && (
          <div className="flex-1 mx-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        )}
      </button>

      {!collapsed && (
        <div className="space-y-2 ml-7 mt-1">
          {items.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}

          {adding ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAdd();
                  if (e.key === "Escape") { setNewTitle(""); setAdding(false); }
                }}
                onBlur={commitAdd}
                placeholder="Task title..."
                className="h-8 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function Checklist() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const { data: rawItems = [], isLoading } = useListChecklistItems({ userId });
  const createMutation = useCreateChecklistItem();
  const updateMutation = useUpdateChecklistItem();
  const deleteMutation = useDeleteChecklistItem();
  const templateMutation = useLoadChecklistTemplate();

  const items = rawItems as Item[];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/checklist"] });

  const handleToggle = async (id: number, completed: boolean) => {
    await updateMutation.mutateAsync({ id, data: { completed } });
    invalidate();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    invalidate();
  };

  const handleUpdate = async (id: number, patch: Partial<{ title: string; dueDate: string; notes: string }>) => {
    await updateMutation.mutateAsync({ id, data: patch });
    invalidate();
  };

  const handleAdd = async (title: string, category: Category) => {
    await createMutation.mutateAsync({ data: { userId, title, category } });
    invalidate();
  };

  const handleLoadTemplate = async () => {
    await templateMutation.mutateAsync({ data: { userId } });
    invalidate();
  };

  const totalDone = items.filter((i) => i.completed).length;
  const totalItems = items.length;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const visibleItems = filter === "todo"
    ? items.filter((i) => !i.completed)
    : filter === "done"
    ? items.filter((i) => i.completed)
    : items;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = visibleItems.filter((i) => i.category === cat.key);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Common App Checklist</h1>
          <p className="text-muted-foreground mt-1">Track everything you need to do from start to decision day.</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            {(["all", "todo", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30"}`}
              >
                {f === "all" ? "All" : f === "todo" ? "To Do" : "Done"}
              </button>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="text-center py-24 border rounded-2xl border-dashed">
          <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start your Common App checklist</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Load our curated 28-item template covering essays, testing, recommendations, and more — or build your own from scratch.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={handleLoadTemplate}
              disabled={templateMutation.isPending}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {templateMutation.isPending ? "Loading..." : "Load Template (28 tasks)"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAdd("My first task", "other")}
            >
              Start from scratch
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Overall Progress</span>
              <span className="text-sm font-bold text-primary">{totalDone}/{totalItems} completed</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{pct}% done</span>
              {pct === 100 && (
                <span className="text-xs font-medium text-green-600">🎉 All done! Good luck!</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const catItems = grouped[cat.key] ?? [];
              const allItems = items.filter((i) => i.category === cat.key);
              if (allItems.length === 0 && filter === "all") {
                return (
                  <CategorySection
                    key={cat.key}
                    cat={cat}
                    items={[]}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onAdd={handleAdd}
                  />
                );
              }
              if (catItems.length === 0 && filter !== "all") return null;
              return (
                <CategorySection
                  key={cat.key}
                  cat={cat}
                  items={catItems}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onAdd={handleAdd}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
