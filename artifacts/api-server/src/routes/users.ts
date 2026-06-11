import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, postsTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/users", async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { search, limit = 20, offset = 0 } = parsed.data;

  let query = db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      bio: usersTable.bio,
      gradYear: usersTable.gradYear,
      gpa: usersTable.gpa,
      satScore: usersTable.satScore,
      actScore: usersTable.actScore,
      targetColleges: usersTable.targetColleges,
      extracurriculars: usersTable.extracurriculars,
      postCount: sql<number>`(select count(*) from ${postsTable} where ${postsTable.userId} = ${usersTable.id})::int`,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .$dynamic();

  if (search) {
    query = query.where(ilike(usersTable.username, `%${search}%`));
  }

  const users = await query.limit(limit).offset(offset);
  res.json(users);
});

router.post("/users", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  const result = {
    ...user,
    postCount: 0,
  };
  res.status(201).json(result);
});

router.get("/users/:id", async (req, res) => {
  const parsed = GetUserParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [user] = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      bio: usersTable.bio,
      gradYear: usersTable.gradYear,
      gpa: usersTable.gpa,
      satScore: usersTable.satScore,
      actScore: usersTable.actScore,
      targetColleges: usersTable.targetColleges,
      extracurriculars: usersTable.extracurriculars,
      postCount: sql<number>`(select count(*) from ${postsTable} where ${postsTable.userId} = ${usersTable.id})::int`,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, parsed.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/users/:id", async (req, res) => {
  const paramsParsed = UpdateUserParams.safeParse(req.params);
  const bodyParsed = UpdateUserBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set(bodyParsed.data)
    .where(eq(usersTable.id, paramsParsed.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const result = {
    ...user,
    postCount: 0,
  };
  res.json(result);
});

export default router;
