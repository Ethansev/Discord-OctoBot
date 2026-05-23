import axios from 'axios';
import {
  AttachmentBuilder,
  Events,
  GuildMember,
  Message,
  TextChannel,
} from 'discord.js';
import { quotesData } from '../seeds/callOfDutyQuotes.js';
import type { BotEvent } from '../@types/types.js';
import { config } from '../config.js';
import * as aiPersonality from '../services/aiPersonality.js';
import { log } from '../utility/logger.js';
import { findYourMomTrigger } from '../utility/triggers.js';

async function fetchYourMomJoke(): Promise<string> {
  const response = await axios.get('https://api.yomomma.info/');
  return response.data.joke;
}

async function handleEmojiReactions(message: Message): Promise<boolean> {
  if (message.content.includes(':bettermoyai:')) {
    log.info('msg', `emoji-reaction (bettermoyai) triggered by ${message.author.tag}`);
    await message.reply('<:othermoyai:1004468892334297148>');
    return true;
  }
  if (message.content.includes(':othermoyai:')) {
    log.info('msg', `emoji-reaction (othermoyai) triggered by ${message.author.tag}`);
    await message.reply('<:bettermoyai:1004470188877561977>');
    return true;
  }
  if (message.content.includes('🗿')) {
    log.info('msg', `emoji-reaction (moai) triggered by ${message.author.tag}`);
    await message.reply('fuck off');
    return true;
  }
  return false;
}

async function handleJoelKick(message: Message): Promise<boolean> {
  if (!config.discord.joelUserId) return false;
  if (message.author.id !== config.discord.joelUserId) return false;
  if (message.system || !message.guild) return false;

  log.info('msg', `Joel-kick fired for ${message.author.tag} in ${message.guild.name}`);

  const member = message.guild.members.cache.get(message.author.id) as GuildMember | undefined;
  if (!member?.kickable) {
    log.warn('msg', 'Joel-kick: member not kickable, skipping');
    return false;
  }

  const quote = quotesData[Math.floor(Math.random() * quotesData.length)];
  const channel = message.guild.channels.cache.find(
    (ch) => ch.name === config.discord.botCommandsChannel
  );

  try {
    const file = new AttachmentBuilder('./media/Ether_Griffguyen.png');
    await message.author.send({ files: [file] }).catch(() => undefined);
    await message.author.send('fuck you Joel').catch(() => undefined);

    if (channel && channel instanceof TextChannel) {
      await channel.send(
        `"*${quote.quote}*" - ${quote.author}\n\n**Joel got dicked :)**`
      );
    }

    await member.kick('Joel posted in chat.');
    log.info('msg', 'Joel-kick: kicked successfully');
    return true;
  } catch (error) {
    log.error('msg', 'Joel-kick failed', error);
    return false;
  }
}

async function shouldRunAiPersonality(message: Message): Promise<boolean> {
  if (!config.features.aiPersonality) return false;
  const botUser = message.client.user;
  if (!botUser) return false;
  if (message.mentions.has(botUser)) return true;
  return await aiPersonality.isReplyToBot(message);
}

const event: BotEvent = {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    if (await handleJoelKick(message)) return;

    if (await shouldRunAiPersonality(message)) {
      const where = message.guild ? message.guild.name : 'DM';
      log.info('ai', `responding to ${message.author.tag} in ${where}`);
      await aiPersonality.respond(message);
      return;
    }

    if (await handleEmojiReactions(message)) return;

    if (findYourMomTrigger(message.content)) {
      log.info('msg', `your-mom trigger by ${message.author.tag}`);
      try {
        const joke = await fetchYourMomJoke();
        await message.reply(joke);
      } catch (error) {
        log.error('msg', 'your-momma joke fetch failed', error);
      }
    }
  },
};

export default event;
