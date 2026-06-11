import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, usersTable, collegesTable, commentsTable, likesTable } from "@workspace/db";
import { eq, sql, desc, asc, and, or, ilike } from "drizzle-orm";
import { createNotification } from "./notifications";
import {
  ListPostsQueryParams,
  CreatePostBody,
  GetPostParams,
  DeletePostParams,
  TogglePostLikeParams,
  TogglePostLikeBody,
  GetTrendingPostsQueryParams,
} from "@workspace/api-zod";

const router = Router();

function postSelectFields(userId?: number) {
  return {
    id: postsTable.id,
    userId: postsTable.userId,
    username: usersTable.username,
    displayName: usersTable.displayName,
    avatarUrl: usersTable.avatarUrl,
    title: postsTable.title,
    content: postsTable.content,
    category: postsTable.category,
    collegeId: postsTable.collegeId,
    collegeName: collegesTable.name,
    likeCount: sql<number>`(select count(*) from ${likesTable} where ${likesTable.postId} = ${postsTable.id})::int`,
    commentCount: sql<number>`(select count(*) from ${commentsTable} where ${commentsTable.postId} = ${postsTable.id})::int`,
    isLiked: userId
      ? sql<boolean>`exists(select 1 from ${likesTable} where ${likesTable.postId} = ${postsTable.id} and ${likesTable.userId} = ${userId})`
      : sql<boolean>`false`,
    createdAt: postsTable.createdAt,
  };
}

router.get("/posts", async (req, res) => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, collegeId, search, sortBy = "newest", limit = 20, offset = 0 } = parsed.data;

  const likeCountExpr = sql<number>`(select count(*) from ${likesTable} where ${likesTable.postId} = ${postsTable.id})::int`;
  const commentCountExpr = sql<number>`(select count(*) from ${commentsTable} where ${commentsTable.postId} = ${postsTable.id})::int`;

  const orderExpr =
    sortBy === "most_liked"
      ? [desc(likeCountExpr), desc(postsTable.createdAt)]
      : sortBy === "most_discussed"
      ? [desc(commentCountExpr), desc(postsTable.createdAt)]
      : [desc(postsTable.createdAt)];

  let query = db
    .select(postSelectFields())
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .leftJoin(collegesTable, eq(postsTable.collegeId, collegesTable.id))
    .orderBy(...orderExpr)
    .$dynamic();

  const conditions = [];
  if (category) conditions.push(eq(postsTable.category, category));
  if (collegeId) conditions.push(eq(postsTable.collegeId, collegeId));
  if (search) {
    const term = `%${search}%`;
    conditions.push(or(ilike(postsTable.title, term), ilike(postsTable.content, term))!);
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const posts = await query.limit(limit).offset(offset);
  res.json(posts);
});

router.post("/posts", async (req, res) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.issues });
    return;
  }
  const [post] = await db.insert(postsTable).values(parsed.data).returning();

  const [user] = await db.select({ username: usersTable.username, displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
    .from(usersTable).where(eq(usersTable.id, post.userId));

  let collegeName = null;
  if (post.collegeId) {
    const [college] = await db.select({ name: collegesTable.name }).from(collegesTable).where(eq(collegesTable.id, post.collegeId));
    collegeName = college?.name ?? null;
  }

  res.status(201).json({
    ...post,
    username: user?.username ?? "",
    displayName: user?.displayName ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    collegeName,
    likeCount: 0,
    commentCount: 0,
    isLiked: false,
  });
});

router.get("/posts/:id", async (req, res) => {
  const parsed = GetPostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const [post] = await db
    .select(postSelectFields())
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .leftJoin(collegesTable, eq(postsTable.collegeId, collegesTable.id))
    .where(eq(postsTable.id, parsed.data.id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const comments = await db
    .select({
      id: commentsTable.id,
      postId: commentsTable.postId,
      userId: commentsTable.userId,
      username: usersTable.username,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      content: commentsTable.content,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.postId, parsed.data.id))
    .orderBy(commentsTable.createdAt);

  res.json({ ...post, comments });
});

router.delete("/posts/:id", async (req, res) => {
  const parsed = DeletePostParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, parsed.data.id));
  res.status(204).send();
});

router.post("/posts/:id/like", async (req, res) => {
  const paramsParsed = TogglePostLikeParams.safeParse(req.params);
  const bodyParsed = TogglePostLikeBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { id: postId } = paramsParsed.data;
  const { userId, liked } = bodyParsed.data;

  if (liked) {
    const inserted = await db.insert(likesTable).values({ postId, userId }).onConflictDoNothing().returning();
    if (inserted.length > 0) {
      const [postRow] = await db.select({ userId: postsTable.userId }).from(postsTable).where(eq(postsTable.id, postId));
      if (postRow) {
        createNotification({ userId: postRow.userId, actorId: userId, type: "like", postId }).catch(() => {});
      }
    }
  } else {
    await db.delete(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)));
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(likesTable)
    .where(eq(likesTable.postId, postId));

  res.json({ liked, likeCount: count });
});

router.get("/feed/trending", async (req, res) => {
  const parsed = GetTrendingPostsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const posts = await db
    .select(postSelectFields())
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .leftJoin(collegesTable, eq(postsTable.collegeId, collegesTable.id))
    .orderBy(
      sql`(select count(*) from ${likesTable} where ${likesTable.postId} = ${postsTable.id}) + (select count(*) from ${commentsTable} where ${commentsTable.postId} = ${postsTable.id}) desc`
    )
    .limit(limit);

  res.json(posts);
});

export default router;
