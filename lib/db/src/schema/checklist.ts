import { pgTable, serial, integer, text, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const checklistItemsTable = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("other"),
  completed: boolean("completed").notNull().default(false),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ChecklistItem = typeof checklistItemsTable.$inferSelect;
