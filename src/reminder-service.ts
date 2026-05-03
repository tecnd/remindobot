import type { Client, TextChannel } from "discord.js";
import { eq } from "drizzle-orm";

import { db } from "./database.js";
import { reminders } from "./db/schema/reminders.js";
import type { ReminderData, ReminderRow } from "./db/schema/reminders.js";

// JavaScript setTimeout max is ~24.8 days (2^31-1 ms)
const MAX_TIMEOUT = 2147483647;

async function addReminder(reminderData: ReminderData) {
  const [row] = await db.insert(reminders).values(reminderData).returning();
  return row!;
}

async function removeReminder(reminderId: number) {
  await db.delete(reminders).where(eq(reminders.id, reminderId));
}

async function getAllReminders() {
  return await db.select().from(reminders);
}

/** Arm timers for an existing DB row (no insert). */
async function armReminder(client: Client, reminder: ReminderRow) {
  const delay = reminder.time - Date.now();

  if (delay < 0) {
    await sendReminder(client, reminder);
    return;
  }

  if (delay > MAX_TIMEOUT) {
    setTimeout(() => {
      void armReminder(client, reminder).catch((e) => console.error(e));
    }, MAX_TIMEOUT);
    return;
  }

  setTimeout(() => {
    void sendReminder(client, reminder).catch((e) => console.error(e));
  }, delay);
}

export async function scheduleReminder(
  client: Client,
  reminderData: ReminderData,
) {
  const reminder = await addReminder(reminderData);
  void armReminder(client, reminder).catch((e) => console.error(e));
}

async function sendReminder(client: Client, reminder: ReminderRow) {
  try {
    const channel = (await client.channels.fetch(
      reminder.channelId,
    )) as TextChannel;

    if (!channel) {
      console.error(`Channel ${reminder.channelId} not found`);
      await removeReminder(reminder.id);
      return;
    }

    await channel.send(
      `${reminder.target} 🔔 **Reminder:** ${reminder.message}`,
    );

    await removeReminder(reminder.id);
  } catch (error) {
    console.error("Error sending reminder:", error);
    await removeReminder(reminder.id);
  }
}

export async function initializeReminders(client: Client) {
  const rows = await getAllReminders();

  console.log(`Loading ${rows.length} saved reminders...`);

  for (const reminder of rows) {
    void armReminder(client, reminder).catch((e) => console.error(e));
  }
}
