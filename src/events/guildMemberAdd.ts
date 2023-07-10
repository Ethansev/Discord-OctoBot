import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../@types/types';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    console.log(member);
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find((ch) => ch.name === 'bot-commands');
    // voice channels do not have a send() method so we need to specify the channel type
    channel ? (channel as TextChannel).send(`Hi ${member}. We added ~poo to your name!`) : null;
  },
};

export default event;
