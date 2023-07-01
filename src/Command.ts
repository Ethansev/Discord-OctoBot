import { Client } from "./Client";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  Message,
  MessageComponentInteraction,
  StageChannel,
  //   TextBasedChannel,
  VoiceChannel,
} from "discord.js";

export abstract class Command {
  client: Client;
  abstract name: string;
  abstract visible: boolean;
  abstract description: string;
  abstract information: string;
  abstract aliases: string[];
  abstract args: boolean;
  abstract usage: string;
  abstract example: string;
  abstract cooldown: number;
  abstract category: string;
  abstract guildOnly: boolean;
  abstract data: Omit<
    SlashCommandBuilder,
    "addSubcommand" | "addSubcommandGroup"
  >;
  abstract execute: (message: Message, args?: string[]) => Promise<Message>;
  abstract executeSlash: (interaction: CommandInteraction) => Promise<void>;

  public constructor(client: Client) {
    this.client = client;
  }

  //   /**
  //    * Check if the bot has permissions to join the voice channel.
  //    *
  //    * @param voiceChannel the voice channel to join
  //    * @returns a string with the issue preventing the bot from connecting, else
  //    *          null if there are no issues
  //    */
  //   protected hasPermissions(voiceChannel: VoiceChannel | StageChannel): string {
  //     const permissions = voiceChannel.permissionsFor(this.client.user);
  //     if (!permissions.has("CONNECT")) {
  //       return "I need the permissions to join your voice channel!";
  //     } else if (!permissions.has("SPEAK")) {
  //       return "I need the permissions to speak in your voice channel!";
  //     }
  //     return null;
  //   }

  //   /**
  //    * Returns a duration formatted in (MM:HH:SS) or (MM:SS) if it is less than an
  //    * hour. If it is a livestream, then send the string "livestream"
  //    *
  //    * @param seconds the duration in seconds
  //    * @returns a formatted version of the duration
  //    */
  //   protected formatDuration(seconds: number): string {
  //     if (seconds === 0) {
  //       return "livestream";
  //     } else if (seconds < 3600) {
  //       return new Date(seconds * 1000).toISOString().substr(14, 5);
  //     } else {
  //       return new Date(seconds * 1000).toISOString().substr(11, 8);
  //     }
  //   }
}
