import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";

const TOKEN = process.env.TOKEN!;
const APPLICATION_ID = process.env.APPLICATION_ID!;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GUILD_ID = process.env.GUILD_ID!;

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
try {
  console.log(`Started refreshing ${commands.size} application (/) commands.`);

  // The put method is used to fully refresh all commands in the guild with the current set
  const data = (await rest.put(
    // Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
    Routes.applicationCommands(APPLICATION_ID),
    { body: commands.map((command) => command.data.toJSON()) },
  )) as unknown[];

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
  // And of course, make sure you catch and log any errors!
  console.error(error);
}
