import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collegesTable = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  state: text("state"),
  type: text("type").notNull().default("private"),
  acceptanceRate: real("acceptance_rate").notNull(),
  medianGpa: real("median_gpa"),
  medianSat: integer("median_sat"),
  medianAct: integer("median_act"),
  enrollment: integer("enrollment"),
  description: text("description"),
  logoUrl: text("logo_url"),
  color: text("color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCollegeSchema = createInsertSchema(collegesTable).omit({ id: true, createdAt: true });
export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof collegesTable.$inferSelect;
