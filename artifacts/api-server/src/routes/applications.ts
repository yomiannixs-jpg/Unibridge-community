import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, collegesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  UpdateApplicationBody,
  UpdateApplicationParams,
  DeleteApplicationParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/applications", async (req, res) => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { userId } = parsed.data;

  const applications = await db
    .select({
      id: applicationsTable.id,
      userId: applicationsTable.userId,
      collegeId: applicationsTable.collegeId,
      collegeName: collegesTable.name,
      collegeLocation: collegesTable.location,
      collegeColor: collegesTable.color,
      collegeAcceptanceRate: collegesTable.acceptanceRate,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      deadline: applicationsTable.deadline,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .innerJoin(collegesTable, eq(applicationsTable.collegeId, collegesTable.id))
    .where(eq(applicationsTable.userId, userId))
    .orderBy(applicationsTable.createdAt);

  res.json(applications);
});

router.post("/applications", async (req, res) => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error });
    return;
  }

  const { userId, collegeId, status, notes, deadline } = parsed.data;

  const existing = await db
    .select({ id: applicationsTable.id })
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.userId, userId),
        eq(applicationsTable.collegeId, collegeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "College already in your tracker" });
    return;
  }

  const [inserted] = await db
    .insert(applicationsTable)
    .values({ userId, collegeId, status: status ?? "planning", notes, deadline })
    .returning();

  const [application] = await db
    .select({
      id: applicationsTable.id,
      userId: applicationsTable.userId,
      collegeId: applicationsTable.collegeId,
      collegeName: collegesTable.name,
      collegeLocation: collegesTable.location,
      collegeColor: collegesTable.color,
      collegeAcceptanceRate: collegesTable.acceptanceRate,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      deadline: applicationsTable.deadline,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .innerJoin(collegesTable, eq(applicationsTable.collegeId, collegesTable.id))
    .where(eq(applicationsTable.id, inserted.id));

  res.status(201).json(application);
});

router.patch("/applications/:id", async (req, res) => {
  const idParsed = UpdateApplicationParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const bodyParsed = UpdateApplicationBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body", details: bodyParsed.error });
    return;
  }

  const { id } = idParsed.data;
  const updates: Record<string, unknown> = {};
  if (bodyParsed.data.status !== undefined) updates.status = bodyParsed.data.status;
  if (bodyParsed.data.notes !== undefined) updates.notes = bodyParsed.data.notes;
  if (bodyParsed.data.deadline !== undefined) updates.deadline = bodyParsed.data.deadline;
  updates.updatedAt = new Date();

  await db
    .update(applicationsTable)
    .set(updates)
    .where(eq(applicationsTable.id, id));

  const [application] = await db
    .select({
      id: applicationsTable.id,
      userId: applicationsTable.userId,
      collegeId: applicationsTable.collegeId,
      collegeName: collegesTable.name,
      collegeLocation: collegesTable.location,
      collegeColor: collegesTable.color,
      collegeAcceptanceRate: collegesTable.acceptanceRate,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      deadline: applicationsTable.deadline,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .innerJoin(collegesTable, eq(applicationsTable.collegeId, collegesTable.id))
    .where(eq(applicationsTable.id, id));

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(application);
});

router.delete("/applications/:id", async (req, res) => {
  const idParsed = DeleteApplicationParams.safeParse(req.params);
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.id, idParsed.data.id));

  res.status(204).send();
});

export default router;
