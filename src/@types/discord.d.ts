import { Collection } from "discord.js";

// doesn't matter anymore since I made a new client using discord's client as the parent class
declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
  }
}
