import { Router } from "express";
import { db } from "@workspace/db";
import { resourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListResourcesQueryParams, CreateResourceBody } from "@workspace/api-zod";

const router = Router();

router.get("/resources", async (req, res) => {
  const parsed = ListResourcesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category } = parsed.data;

  let query = db.select().from(resourcesTable).$dynamic();
  if (category) {
    query = query.where(eq(resourcesTable.category, category));
  }
  const resources = await query.orderBy(resourcesTable.createdAt);
  res.json(resources);
});

router.post("/resources", async (req, res) => {
  const parsed = CreateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const [resource] = await db.insert(resourcesTable).values(parsed.data).returning();
  res.status(201).json(resource);
});

export default router;
