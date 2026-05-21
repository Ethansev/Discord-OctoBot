import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  SharedSlashCommand,
} from 'discord.js';

export interface BotEvent {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
}

export interface SlashCommand {
  command: SharedSlashCommand;
  execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => void | Promise<void>;
  cooldown?: number;
}

declare module 'discord.js' {
  interface Client {
    slashCommands: Collection<string, SlashCommand>;
  }
}
