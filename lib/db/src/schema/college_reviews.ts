import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { collegesTable } from "./colleges";

export const collegeReviewsTable = pgTable("college_reviews", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").notNull().references(() => collegesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  gpa: real("gpa"),
  satScore: integer("sat_score"),
  actScore: integer("act_score"),
  content: text("content"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCollegeReviewSchema = createInsertSchema(collegeReviewsTable).omit({ id: true, createdAt: true });
export type InsertCollegeReview = z.infer<typeof insertCollegeReviewSchema>;
export type CollegeReview = typeof collegeReviewsTable.$inferSelect;
