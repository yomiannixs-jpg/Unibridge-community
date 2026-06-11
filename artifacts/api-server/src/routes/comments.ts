import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable, usersTable, postsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createNotification } from "./notifications";
import {
  ListCommentsParams,
  CreateCommentParams,
  CreateCommentBody,
  DeleteCommentParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/posts/:id/comments", async (req, res) => {
  const parsed = ListCommentsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
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

  res.json(comments);
});

router.post("/posts/:id/comments", async (req, res) => {
  const paramsParsed = CreateCommentParams.safeParse(req.params);
  const bodyParsed = CreateCommentBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [comment] = await db
    .insert(commentsTable)
    .values({ ...bodyParsed.data, postId: paramsParsed.data.id })
    .returning();

  const [user] = await db
    .select({ username: usersTable.username, displayName: usersTable.displayName, avatarUrl: usersTable.avatarUrl })
    .from(usersTable)
    .where(eq(usersTable.id, comment.userId));

  const [postRow] = await db
    .select({ userId: postsTable.userId })
    .from(postsTable)
    .where(eq(postsTable.id, comment.postId));
  if (postRow) {
    createNotification({ userId: postRow.userId, actorId: comment.userId, type: "comment", postId: comment.postId }).catch(() => {});
  }

  res.status(201).json({
    ...comment,
    username: user?.username ?? "",
    displayName: user?.displayName ?? null,
    avatarUrl: user?.avatarUrl ?? null,
  });
});

router.delete("/comments/:id", async (req, res) => {
  const parsed = DeleteCommentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db.delete(commentsTable).where(eq(commentsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
