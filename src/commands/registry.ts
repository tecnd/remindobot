import { Collection } from "discord.js";

import type {
  ChatInputCommandInteraction,
  SharedSlashCommand,
} from "discord.js";

export abstract class AbstractCommand {
  abstract readonly data: SharedSlashCommand;
  abstract readonly execute: (
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

export const commands = new Collection<string, AbstractCommand>();

/** Command annotation registers commands to this collection */
export function Command() {
  return <T extends new () => AbstractCommand>(
    Target: T,
    context: ClassDecoratorContext,
  ) => {
    context.addInitializer(function () {
      const instance: AbstractCommand = new Target();
      commands.set(instance.data.name, instance);
    });
  };
}
