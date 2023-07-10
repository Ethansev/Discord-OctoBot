import { BaseInteraction, Collection, CommandInteraction } from 'discord.js';
import { Client } from './Client';

// Should probably move these to their own files but this is fine for now

// doesn't matter anymore since I made a new client using discord's client as the parent class
// declare module "discord.js" {
//   export interface Client {
//     commands: Collection<any, any>;
//   }
// }

export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args) => void;
}

export abstract class Event {
  client: Client;
  abstract run: (args?: unknown) => void;

  constructor(client: Client) {
    this.client = client;
  }
}

export interface Command {
  name: string;
  execute: (interaction: CommandInteraction) => void;
  permissions: Array<PermissionResolvable>;
  aliases: Array<string>;
  cooldown?: number;
}

export interface SlashCommand {
  command: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}
