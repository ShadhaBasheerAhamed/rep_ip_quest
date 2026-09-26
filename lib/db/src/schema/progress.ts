import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const progressTable = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  levelId: integer("level_id").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  livesRemaining: integer("lives_remaining").notNull().default(30),
  completed: boolean("completed").notNull().default(false),
  tabSwitches: integer("tab_switches").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progressTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progressTable.$inferSelect;
