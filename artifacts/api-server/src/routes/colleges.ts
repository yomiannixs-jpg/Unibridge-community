import { Router } from "express";
import { db } from "@workspace/db";
import { collegesTable, collegeReviewsTable, postsTable, usersTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import {
  ListCollegesQueryParams,
  CreateCollegeBody,
  GetCollegeParams,
  ListCollegeReviewsParams,
  CreateCollegeReviewParams,
  CreateCollegeReviewBody,
  GetPopularCollegesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/colleges", async (req, res) => {
  const parsed = ListCollegesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { search, limit = 20, offset = 0 } = parsed.data;

  let query = db
    .select({
      id: collegesTable.id,
      name: collegesTable.name,
      location: collegesTable.location,
      state: collegesTable.state,
      type: collegesTable.type,
      acceptanceRate: collegesTable.acceptanceRate,
      medianGpa: collegesTable.medianGpa,
      medianSat: collegesTable.medianSat,
      medianAct: collegesTable.medianAct,
      enrollment: collegesTable.enrollment,
      description: collegesTable.description,
      logoUrl: collegesTable.logoUrl,
      color: collegesTable.color,
      postCount: sql<number>`(select count(*) from ${postsTable} where ${postsTable.collegeId} = ${collegesTable.id})::int`,
      reviewCount: sql<number>`(select count(*) from ${collegeReviewsTable} where ${collegeReviewsTable.collegeId} = ${collegesTable.id})::int`,
      createdAt: collegesTable.createdAt,
    })
    .from(collegesTable)
    .$dynamic();

  if (search) {
    query = query.where(ilike(collegesTable.name, `%${search}%`));
  }

  const colleges = await query.limit(limit).offset(offset);
  res.json(colleges);
});

router.post("/colleges", async (req, res) => {
  const parsed = CreateCollegeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const [college] = await db.insert(collegesTable).values(parsed.data).returning();
  const result = { ...college, postCount: 0, reviewCount: 0 };
  res.status(201).json(result);
});

router.get("/colleges/:id", async (req, res) => {
  const parsed = GetCollegeParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [college] = await db
    .select({
      id: collegesTable.id,
      name: collegesTable.name,
      location: collegesTable.location,
      state: collegesTable.state,
      type: collegesTable.type,
      acceptanceRate: collegesTable.acceptanceRate,
      medianGpa: collegesTable.medianGpa,
      medianSat: collegesTable.medianSat,
      medianAct: collegesTable.medianAct,
      enrollment: collegesTable.enrollment,
      description: collegesTable.description,
      logoUrl: collegesTable.logoUrl,
      color: collegesTable.color,
      postCount: sql<number>`(select count(*) from ${postsTable} where ${postsTable.collegeId} = ${collegesTable.id})::int`,
      reviewCount: sql<number>`(select count(*) from ${collegeReviewsTable} where ${collegeReviewsTable.collegeId} = ${collegesTable.id})::int`,
      createdAt: collegesTable.createdAt,
    })
    .from(collegesTable)
    .where(eq(collegesTable.id, parsed.data.id));

  if (!college) {
    res.status(404).json({ error: "College not found" });
    return;
  }
  res.json(college);
});

router.get("/colleges/:id/reviews", async (req, res) => {
  const parsed = ListCollegeReviewsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const reviews = await db
    .select({
      id: collegeReviewsTable.id,
      collegeId: collegeReviewsTable.collegeId,
      userId: collegeReviewsTable.userId,
      username: usersTable.username,
      displayName: usersTable.displayName,
      status: collegeReviewsTable.status,
      gpa: collegeReviewsTable.gpa,
      satScore: collegeReviewsTable.satScore,
      actScore: collegeReviewsTable.actScore,
      content: collegeReviewsTable.content,
      createdAt: collegeReviewsTable.createdAt,
    })
    .from(collegeReviewsTable)
    .innerJoin(usersTable, eq(collegeReviewsTable.userId, usersTable.id))
    .where(eq(collegeReviewsTable.collegeId, parsed.data.id))
    .orderBy(sql`${collegeReviewsTable.createdAt} desc`);
  res.json(reviews);
});

router.post("/colleges/:id/reviews", async (req, res) => {
  const paramsParsed = CreateCollegeReviewParams.safeParse(req.params);
  const bodyParsed = CreateCollegeReviewBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [review] = await db
    .insert(collegeReviewsTable)
    .values({ ...bodyParsed.data, collegeId: paramsParsed.data.id })
    .returning();

  const [user] = await db.select({ username: usersTable.username, displayName: usersTable.displayName })
    .from(usersTable).where(eq(usersTable.id, review.userId));

  res.status(201).json({ ...review, username: user?.username ?? "", displayName: user?.displayName ?? null });
});

router.get("/feed/colleges/popular", async (req, res) => {
  const parsed = GetPopularCollegesQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 8) : 8;

  const colleges = await db
    .select({
      id: collegesTable.id,
      name: collegesTable.name,
      location: collegesTable.location,
      acceptanceRate: collegesTable.acceptanceRate,
      logoUrl: collegesTable.logoUrl,
      color: collegesTable.color,
      postCount: sql<number>`(select count(*) from ${postsTable} where ${postsTable.collegeId} = ${collegesTable.id})::int`,
      reviewCount: sql<number>`(select count(*) from ${collegeReviewsTable} where ${collegeReviewsTable.collegeId} = ${collegesTable.id})::int`,
    })
    .from(collegesTable)
    .orderBy(sql`(select count(*) from ${postsTable} where ${postsTable.collegeId} = ${collegesTable.id}) desc`)
    .limit(limit);

  res.json(colleges);
});

export default router;
