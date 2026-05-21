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
  aiPersonality: flag('FF_AI_PERSONALITY'),
  twitchAnnouncer: flag('FF_TWITCH_ANNOUNCER'),
  music: flag('FF_MUSIC'),
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
  aiPersonality: {
    promptFile: process.env.AI_PERSONALITY_PROMPT_FILE ?? 'prompts/ai-personality.md',
    cooldownSeconds: Number(process.env.AI_PERSONALITY_COOLDOWN_SECONDS ?? '10'),
    maxInputChars: 2000,
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    streamerUsername: process.env.TWITCH_STREAMER_USERNAME,
    announceChannelId: process.env.TWITCH_ANNOUNCE_CHANNEL_ID,
    pollIntervalSeconds: Number(process.env.TWITCH_POLL_INTERVAL_SECONDS ?? '60'),
  },
};

export type Config = typeof config;
