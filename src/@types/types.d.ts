import { Collection } from 'discord.js';
import { Client } from './Client';

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
