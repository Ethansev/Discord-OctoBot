import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Message } from 'discord.js';
import { config } from '../config.js';
import { Cooldown, truncateForPrompt } from '../utility/cooldown.js';
import { log } from '../utility/logger.js';
import { chatComplete } from './openai.js';

const cooldown = new Cooldown(config.aiPersonality.cooldownSeconds * 1000);

let cachedPrompt: string | undefined;
function getSystemPrompt(): string {
  if (cachedPrompt !== undefined) return cachedPrompt;
  const promptPath = path.resolve(config.aiPersonality.promptFile);
  try {
    cachedPrompt = readFileSync(promptPath, 'utf8').trim();
    return cachedPrompt;
  } catch (error) {
    throw new Error(
      `Failed to load AI personality prompt at ${promptPath}. ` +
        `Create the file or set AI_PERSONALITY_PROMPT_FILE. Cause: ${(error as Error).message}`
    );
  }
}

export async function isReplyToBot(message: Message): Promise<boolean> {
  if (!message.reference?.messageId) return false;
  try {
    const referenced = await message.fetchReference();
    return referenced.author.id === message.client.user.id;
  } catch {
    return false;
  }
}

export async function respond(message: Message): Promise<void> {
  if (cooldown.isOnCooldown(message.author.id)) {
    log.info('ai', `cooldown rejected ${message.author.tag}`);
    await message.react('⏳').catch(() => undefined);
    return;
  }
  cooldown.mark(message.author.id);

  const stripped = message.content.replace(/<@!?\d+>/g, '').trim();
  if (!stripped) {
    log.info('ai', `${message.author.tag} mentioned bot with empty content, skipping`);
    return;
  }

  const prompt = truncateForPrompt(stripped, config.aiPersonality.maxInputChars);
  log.info('ai', `calling OpenAI for ${message.author.tag} (${prompt.length} chars)`);

  try {
    const reply = await chatComplete(prompt, {
      system: getSystemPrompt(),
      maxTokens: 200,
    });
    if (reply.trim()) {
      await message.reply(reply);
      log.info('ai', `reply sent to ${message.author.tag} (${reply.length} chars)`);
    } else {
      log.warn('ai', `empty reply from OpenAI for ${message.author.tag}`);
    }
  } catch (error) {
    log.error('ai', `reply failed for ${message.author.tag}`, error);
  }
}
