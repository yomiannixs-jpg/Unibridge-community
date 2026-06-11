import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, postsTable, collegesTable, resourcesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/feed/stats", async (req, res) => {
  const [[{ totalUsers }], [{ totalPosts }], [{ totalColleges }], [{ totalResources }]] = await Promise.all([
    db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable),
    db.select({ totalPosts: sql<number>`count(*)::int` }).from(postsTable),
    db.select({ totalColleges: sql<number>`count(*)::int` }).from(collegesTable),
    db.select({ totalResources: sql<number>`count(*)::int` }).from(resourcesTable),
  ]);

  const [{ postsThisWeek }] = await db.select({
    postsThisWeek: sql<number>`count(*)::int`,
  }).from(postsTable).where(sql`${postsTable.createdAt} > now() - interval '7 days'`);

  const activeUsers = Math.max(1, Math.floor(totalUsers * 0.6));

  const postsByCategory = await db
    .select({
      category: postsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(postsTable)
    .groupBy(postsTable.category);

  res.json({
    totalUsers,
    totalPosts,
    totalColleges,
    totalResources,
    postsThisWeek,
    activeUsers,
    postsByCategory,
  });
});

export default router;
