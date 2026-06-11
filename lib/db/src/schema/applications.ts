import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { collegesTable } from "./colleges";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  collegeId: integer("college_id").notNull().references(() => collegesTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("planning"),
  notes: text("notes"),
  deadline: date("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Application = typeof applicationsTable.$inferSelect;
