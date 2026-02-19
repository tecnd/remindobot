import {
  type ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { AbstractCommand, Command } from "./registry.js";

@Command()
export class RollCommand extends AbstractCommand {
  readonly data = new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Roll a die.")
    .addIntegerOption((option) =>
      option
        .setName("sides")
        .setDescription("Sides")
        .setMinValue(2)
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName("cheat").setDescription("Cheat?").setRequired(false),
    );

  readonly execute = async (interaction: ChatInputCommandInteraction) => {
    const sides = interaction.options.getInteger("sides", true);
    const cheat = interaction.options.getBoolean("cheat", false);
    // Check if you got caught cheating
    if (cheat && Math.random() < 0.5) {
      const member = interaction.member! as GuildMember;
      try {
        await member.timeout(30_000, "Cheater");
      } catch (e) {
        console.error(e);
      }
      await interaction.reply({
        content: `${member.toString()} was caught cheating and has been timed out.`,
      });
      return;
    }
    // Roll die
    const roll = cheat ? sides : Math.floor(Math.random() * sides) + 1;
    await interaction.reply({
      content: roll.toString(),
    });
  };
}
