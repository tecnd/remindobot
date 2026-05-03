import { type InferSelectModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channelId: text("channel_id").notNull(),
  target: text("target").notNull(),
  message: text("message").notNull(),
  time: integer("time", { mode: "number" }).notNull(),
  createdBy: text("created_by").notNull(),
});

export type ReminderRow = InferSelectModel<typeof reminders>;
/** Payload for inserting a new reminder (`id` is assigned by SQLite). */
export type ReminderData = Omit<ReminderRow, "id">;
