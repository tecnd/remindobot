import "dotenv/config";
import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type CacheType,
  type Interaction,
} from "discord.js";
import { commands } from "./commands/index.js";
import { runMigrations } from "./database.js";
import { initializeReminders } from "./reminder-service.js";

const TOKEN = process.env.TOKEN!;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  try {
    runMigrations();
    void initializeReminders(readyClient).catch((e) => console.error(e));
  } catch (e) {
    console.error(e);
  }
});

client.on(Events.InteractionCreate, (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  handler(interaction).catch((e) => console.error(e));
});

const handler = async (interaction: ChatInputCommandInteraction) => {
  const command = commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: "Command not recognized",
      flags: MessageFlags.Ephemeral,
    });
  }
  return command.execute(interaction);
};

client.login(TOKEN).catch((e) => console.error(e));
