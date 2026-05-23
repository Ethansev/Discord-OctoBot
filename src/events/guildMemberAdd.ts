import { Events, GuildMember, TextChannel } from 'discord.js';
import type { BotEvent } from '../@types/types.js';
import { config } from '../config.js';
import { log } from '../utility/logger.js';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    log.info(
      'member',
      `${member.user.tag} (${member.id}) joined ${member.guild.name}`
    );

    try {
      await member.setNickname(`${member.user.username}poo`);
      log.info('member', `nickname set for ${member.user.tag}`);
    } catch (error) {
      log.error('member', `failed to set nickname for ${member.user.tag}`, error);
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
