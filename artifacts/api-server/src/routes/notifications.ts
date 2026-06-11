import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, usersTable, postsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListNotificationsQueryParams,
  GetUnreadCountQueryParams,
  MarkAllReadBody,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/notifications", async (req, res) => {
  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { userId, unreadOnly = false } = parsed.data;

  let query = db
    .select({
      id: notificationsTable.id,
      userId: notificationsTable.userId,
      actorId: notificationsTable.actorId,
      actorUsername: usersTable.username,
      actorDisplayName: usersTable.displayName,
      type: notificationsTable.type,
      postId: notificationsTable.postId,
      postTitle: postsTable.title,
      read: notificationsTable.read,
      createdAt: notificationsTable.createdAt,
    })
    .from(notificationsTable)
    .innerJoin(usersTable, eq(notificationsTable.actorId, usersTable.id))
    .leftJoin(postsTable, eq(notificationsTable.postId, postsTable.id))
    .where(eq(notificationsTable.userId, userId))
    .$dynamic();

  if (unreadOnly) {
    query = query.where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
  }

  const notifications = await query.orderBy(sql`${notificationsTable.createdAt} desc`).limit(50);
  res.json(notifications);
});

router.get("/notifications/unread-count", async (req, res) => {
  const parsed = GetUnreadCountQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { userId } = parsed.data;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));

  res.json({ count });
});

router.post("/notifications/read-all", async (req, res) => {
  const parsed = MarkAllReadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const result = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.userId, parsed.data.userId), eq(notificationsTable.read, false)))
    .returning();

  res.json({ updated: result.length });
});

router.patch("/notifications/:id/read", async (req, res) => {
  const parsed = MarkNotificationReadParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [notification] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, parsed.data.id))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const [actor] = await db
    .select({ username: usersTable.username, displayName: usersTable.displayName })
    .from(usersTable)
    .where(eq(usersTable.id, notification.actorId));

  const [post] = notification.postId
    ? await db.select({ title: postsTable.title }).from(postsTable).where(eq(postsTable.id, notification.postId))
    : [{ title: null }];

  res.json({
    ...notification,
    actorUsername: actor?.username ?? "",
    actorDisplayName: actor?.displayName ?? null,
    postTitle: post?.title ?? null,
  });
});

export async function createNotification({
  userId,
  actorId,
  type,
  postId,
}: {
  userId: number;
  actorId: number;
  type: "like" | "comment";
  postId?: number;
}) {
  if (userId === actorId) return;
  await db.insert(notificationsTable).values({ userId, actorId, type, postId: postId ?? null });
}

export default router;
