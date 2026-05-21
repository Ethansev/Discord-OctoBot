import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function flag(name: string): boolean {
  return process.env[name]?.toLowerCase() === 'true';
}

const features = {
  aiPersonality: flag('FEATURE_AI_PERSONALITY'),
  twitchAnnouncer: flag('FEATURE_TWITCH_ANNOUNCER'),
  music: flag('FEATURE_MUSIC'),
};

export const config = {
  features,
  discord: {
    token: required('DISCORD_TOKEN'),
    applicationId: required('APPLICATION_ID'),
    botCommandsChannel: process.env.BOT_COMMANDS_CHANNEL ?? 'bot-commands',
    joelUserId: process.env.JOEL_USER_ID,
  },
  openai: {
    apiKey: required('OPENAI_API_KEY'),
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    orgKey: process.env.OPENAI_ORG_KEY,
  },
};

export type Config = typeof config;
