import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const attemptsTable = pgTable("student_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  levelId: integer("level_id").notNull(),
  questionId: text("question_id").notNull(),
  correct: boolean("correct").notNull(),
  answer: text("answer"),
  tabSwitchDetected: boolean("tab_switch_detected").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attemptsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attemptsTable.$inferSelect;
