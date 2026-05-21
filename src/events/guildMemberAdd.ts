import { Events, GuildMember, TextChannel } from 'discord.js';
import type { BotEvent } from '../@types/types.js';
import { config } from '../config.js';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    try {
      await member.setNickname(`${member.user.username}poo`);
    } catch (error) {
      console.error(`Failed to set nickname for ${member.user.username}:`, error);
    }

    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === config.discord.botCommandsChannel
    );
    if (channel instanceof TextChannel) {
      await channel.send(`Hi ${member}. We added ~poo to your name!`);
    }
  },
};

export default event;
