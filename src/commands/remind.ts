import {
  type ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  Role,
  SlashCommandBuilder,
} from "discord.js";
import type { ReminderData } from "../model/reminder.js";
import { scheduleReminder } from "../reminder-service.js";
import { AbstractCommand, Command } from "./registry.js";

type Multiplier = "m" | "h" | "d";
function parseTime(timeStr: string) {
  // Try relative time first (10m, 2h, 1d)
  const relativeMatch = timeStr.match(/^(\d+)(m|h|d)$/i) as
    | [unknown, string, string]
    | null;
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2].toLowerCase() as Multiplier;

    const multipliers = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    } satisfies Record<Multiplier, number>;

    return Date.now() + amount * multipliers[unit];
  }

  // Try absolute date/time
  const date = new Date(timeStr);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }

  return null;
}

@Command()
export class RemindCommand extends AbstractCommand {
  readonly data = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder")
    .addMentionableOption((option) =>
      option
        .setName("target")
        .setDescription("Who to remind (user or role)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription(
          'When to remind (e.g., "10m", "2h", "1d", or "2024-12-25 15:00")',
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Reminder message")
        .setRequired(true),
    );

  readonly execute = async (interaction: ChatInputCommandInteraction) => {
    const target = interaction.options.getMentionable("target", true) as
      | GuildMember
      | Role;
    const timeStr = interaction.options.getString("time", true);
    const message = interaction.options.getString("message", true);

    // Parse time
    const reminderTime = parseTime(timeStr);

    if (!reminderTime) {
      return void interaction.reply({
        content:
          'Invalid time format! Use formats like "10m", "2h", "1d" or "2024-12-25 15:00"',
        ephemeral: true,
      });
    }

    if (reminderTime <= Date.now()) {
      return void interaction.reply({
        content: "Please provide a time in the future!",
        ephemeral: true,
      });
    }

    // Schedule the reminder
    const reminder = {
      channelId: interaction.channel!.id,
      target: target.toString(),
      message: message,
      time: reminderTime,
      createdBy: interaction.user.id,
    } satisfies ReminderData;

    await scheduleReminder(interaction.client, reminder);

    const timeUntil = Math.floor(reminderTime / 1000);
    await interaction.reply({
      content: `✅ Reminder set for ${target.toString()} in <t:${timeUntil}:R> (<t:${timeUntil}:F>)`,
      flags: MessageFlags.Ephemeral,
    });
  };
}
