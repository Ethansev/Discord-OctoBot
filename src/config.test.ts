import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const REQUIRED_ENV = {
  DISCORD_TOKEN: 'token',
  APPLICATION_ID: 'app',
  OPENAI_API_KEY: 'sk-test',
};

async function loadConfig() {
  vi.resetModules();
  const mod = await import('./config.js');
  return mod.config;
}

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...REQUIRED_ENV };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('throws clear error when DISCORD_TOKEN is missing', async () => {
    delete process.env.DISCORD_TOKEN;
    await expect(loadConfig()).rejects.toThrow(/DISCORD_TOKEN/);
  });

  test('throws clear error when APPLICATION_ID is missing', async () => {
    delete process.env.APPLICATION_ID;
    await expect(loadConfig()).rejects.toThrow(/APPLICATION_ID/);
  });

  test('throws clear error when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(loadConfig()).rejects.toThrow(/OPENAI_API_KEY/);
  });

  test('feature flags default to false', async () => {
    const config = await loadConfig();
    expect(config.features.aiPersonality).toBe(false);
    expect(config.features.twitchAnnouncer).toBe(false);
    expect(config.features.music).toBe(false);
  });

  test('feature flags accept "true" (case-insensitive)', async () => {
    process.env.FEATURE_AI_PERSONALITY = 'true';
    process.env.FEATURE_TWITCH_ANNOUNCER = 'TRUE';
    process.env.FEATURE_MUSIC = 'True';
    const config = await loadConfig();
    expect(config.features.aiPersonality).toBe(true);
    expect(config.features.twitchAnnouncer).toBe(true);
    expect(config.features.music).toBe(true);
  });

  test('feature flags reject non-"true" values', async () => {
    process.env.FEATURE_AI_PERSONALITY = '1';
    process.env.FEATURE_TWITCH_ANNOUNCER = 'yes';
    process.env.FEATURE_MUSIC = 'on';
    const config = await loadConfig();
    expect(config.features.aiPersonality).toBe(false);
    expect(config.features.twitchAnnouncer).toBe(false);
    expect(config.features.music).toBe(false);
  });

  test('OPENAI_MODEL defaults to gpt-4o-mini', async () => {
    const config = await loadConfig();
    expect(config.openai.model).toBe('gpt-4o-mini');
  });

  test('OPENAI_MODEL is overridable', async () => {
    process.env.OPENAI_MODEL = 'gpt-4.1';
    const config = await loadConfig();
    expect(config.openai.model).toBe('gpt-4.1');
  });

  test('BOT_COMMANDS_CHANNEL defaults to "bot-commands"', async () => {
    const config = await loadConfig();
    expect(config.discord.botCommandsChannel).toBe('bot-commands');
  });
});
