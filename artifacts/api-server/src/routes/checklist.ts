import { Router } from "express";
import { db } from "@workspace/db";
import { checklistItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListChecklistItemsQueryParams,
  CreateChecklistItemBody,
  LoadChecklistTemplateBody,
  UpdateChecklistItemParams,
  UpdateChecklistItemBody,
  DeleteChecklistItemParams,
} from "@workspace/api-zod";

const router = Router();

const DEFAULT_TEMPLATE = [
  // Essays
  { title: "Brainstorm Common App essay topics", category: "essays" },
  { title: "Write Common App personal statement (650 words)", category: "essays" },
  { title: "Revise and proofread personal statement", category: "essays" },
  { title: "Write supplemental essays for each school", category: "essays" },
  // Testing
  { title: "Register for SAT or ACT", category: "testing" },
  { title: "Take SAT/ACT (aim for target score)", category: "testing" },
  { title: "Send official test scores to colleges", category: "testing" },
  { title: "Check school test-optional policies", category: "testing" },
  // Recommendations
  { title: "Ask 2 teachers for recommendation letters", category: "recommendations" },
  { title: "Ask school counselor for recommendation", category: "recommendations" },
  { title: "Provide teachers with brag sheet / resume", category: "recommendations" },
  { title: "Follow up to confirm letters were submitted", category: "recommendations" },
  // Activities
  { title: "Create activities list (10 activities max)", category: "activities" },
  { title: "Request any awards or honors documentation", category: "activities" },
  { title: "Finalize extracurricular descriptions", category: "activities" },
  // Applications
  { title: "Create Common App account", category: "applications" },
  { title: "Fill out Common App demographics section", category: "applications" },
  { title: "Request official transcripts from school", category: "applications" },
  { title: "Submit Early Decision / Early Action applications", category: "applications" },
  { title: "Submit Regular Decision applications", category: "applications" },
  { title: "Pay or waive application fees for each school", category: "applications" },
  // Financial Aid
  { title: "Create FSA ID (student + parent)", category: "financial_aid" },
  { title: "Complete FAFSA (opens Oct 1)", category: "financial_aid" },
  { title: "Complete CSS Profile if required", category: "financial_aid" },
  { title: "Gather tax documents for financial aid", category: "financial_aid" },
  { title: "Research and apply for scholarships", category: "financial_aid" },
  // Other
  { title: "Visit or virtual-tour target schools", category: "other" },
  { title: "Create a college list spreadsheet", category: "other" },
  { title: "Make final college decision by May 1", category: "other" },
];

router.get("/checklist", async (req, res) => {
  const parsed = ListChecklistItemsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const items = await db
    .select()
    .from(checklistItemsTable)
    .where(eq(checklistItemsTable.userId, parsed.data.userId))
    .orderBy(checklistItemsTable.createdAt);

  res.json(items);
});

router.post("/checklist/template", async (req, res) => {
  const parsed = LoadChecklistTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { userId } = parsed.data;

  // Only load if user has no items yet
  const existing = await db
    .select({ id: checklistItemsTable.id })
    .from(checklistItemsTable)
    .where(eq(checklistItemsTable.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Checklist already has items" });
    return;
  }

  const rows = DEFAULT_TEMPLATE.map((t) => ({
    userId,
    title: t.title,
    category: t.category,
  }));

  const inserted = await db
    .insert(checklistItemsTable)
    .values(rows)
    .returning();

  res.status(201).json(inserted);
});

router.post("/checklist", async (req, res) => {
  const parsed = CreateChecklistItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error });
    return;
  }

  const { userId, title, category, dueDate, notes } = parsed.data;

  const [item] = await db
    .insert(checklistItemsTable)
    .values({ userId, title, category: category ?? "other", dueDate, notes })
    .returning();

  res.status(201).json(item);
});

router.patch("/checklist/:id", async (req, res) => {
  const idParsed = UpdateChecklistItemParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateChecklistItemBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body", details: bodyParsed.error });
    return;
  }

  const updates: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.title !== undefined) updates.title = b.title;
  if (b.category !== undefined) updates.category = b.category;
  if (b.completed !== undefined) updates.completed = b.completed;
  if (b.dueDate !== undefined) updates.dueDate = b.dueDate;
  if (b.notes !== undefined) updates.notes = b.notes;
  updates.updatedAt = new Date();

  await db
    .update(checklistItemsTable)
    .set(updates)
    .where(eq(checklistItemsTable.id, idParsed.data.id));

  const [item] = await db
    .select()
    .from(checklistItemsTable)
    .where(eq(checklistItemsTable.id, idParsed.data.id));

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json(item);
});

router.delete("/checklist/:id", async (req, res) => {
  const idParsed = DeleteChecklistItemParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db
    .delete(checklistItemsTable)
    .where(eq(checklistItemsTable.id, idParsed.data.id));

  res.status(204).send();
});

export default router;
