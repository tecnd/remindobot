import type { Client, TextChannel } from "discord.js";
import { Reminder, type ReminderData } from "./model/reminder.js";

// JavaScript setTimeout max is ~24.8 days (2^31-1 ms)
const MAX_TIMEOUT = 2147483647;

async function addReminder(reminderData: ReminderData) {
  return await Reminder.create(reminderData);
}

async function removeReminder(reminderId: number) {
  await Reminder.destroy({ where: { id: reminderId } });
}

async function getAllReminders() {
  return await Reminder.findAll();
}

export async function scheduleReminder(
  client: Client,
  reminderData: ReminderData,
) {
  // Save to database first
  const reminder = await addReminder(reminderData);

  const delay = reminder.time - Date.now();

  if (delay < 0) {
    // Past due - send immediately
    await sendReminder(client, reminder);
    return;
  }

  if (delay > MAX_TIMEOUT) {
    // For far future reminders, check again in 24 days
    setTimeout(() => {
      scheduleReminder(client, reminder).catch((e) => console.error(e));
    }, MAX_TIMEOUT);

    return;
  }

  setTimeout(() => {
    sendReminder(client, reminder).catch((e) => console.error(e));
  }, delay);
}

async function sendReminder(client: Client, reminder: Reminder) {
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
  const reminders = await getAllReminders();

  console.log(`Loading ${reminders.length} saved reminders...`);

  for (const reminder of reminders) {
    const delay = reminder.time - Date.now();

    if (delay < 0) {
      // Past due - send immediately
      await sendReminder(client, reminder);
    } else {
      // Re-schedule
      if (delay > MAX_TIMEOUT) {
        setTimeout(() => {
          scheduleReminder(client, reminder).catch((e) => console.error(e));
        }, MAX_TIMEOUT);
      } else {
        setTimeout(() => {
          sendReminder(client, reminder).catch((e) => console.error(e));
        }, delay);
      }
    }
  }
}
