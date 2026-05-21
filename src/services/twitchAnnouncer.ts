import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../config.js';
import { isLive, type HelixStream } from './twitch.js';

let wasLive = false;
let timer: NodeJS.Timeout | undefined;

function validateConfig(): void {
  const { clientId, clientSecret, streamerUsername, announceChannelId, pollIntervalSeconds } =
    config.twitch;
  const missing: string[] = [];
  if (!clientId) missing.push('TWITCH_CLIENT_ID');
  if (!clientSecret) missing.push('TWITCH_CLIENT_SECRET');
  if (!streamerUsername) missing.push('TWITCH_STREAMER_USERNAME');
  if (!announceChannelId) missing.push('TWITCH_ANNOUNCE_CHANNEL_ID');
  if (missing.length) {
    throw new Error(`FF_TWITCH_ANNOUNCER is on but missing env vars: ${missing.join(', ')}`);
  }
  if (!Number.isFinite(pollIntervalSeconds) || pollIntervalSeconds < 30) {
    throw new Error(
      `TWITCH_POLL_INTERVAL_SECONDS must be >= 30 (got ${pollIntervalSeconds}). Helix rate-limits aggressive polling.`
    );
  }
}

function buildEmbed(stream: HelixStream): EmbedBuilder {
  const thumb = stream.thumbnail_url
    .replace('{width}', '1280')
    .replace('{height}', '720');
  const url = `https://twitch.tv/${stream.user_login}`;
  return new EmbedBuilder()
    .setColor(0x9146ff)
    .setAuthor({ name: `${stream.user_name} is live on Twitch!`, url })
    .setTitle(stream.title?.trim() || `${stream.user_name} is live`)
    .setURL(url)
    .addFields(
      { name: 'Game', value: stream.game_name || 'Unknown', inline: true },
      { name: 'Viewers', value: String(stream.viewer_count), inline: true }
    )
    .setImage(`${thumb}?t=${Date.now()}`);
}

async function pollOnce(client: Client): Promise<void> {
  const { streamerUsername, announceChannelId } = config.twitch;
  try {
    const stream = await isLive(streamerUsername!);
    if (stream && !wasLive) {
      const channel = await client.channels.fetch(announceChannelId!);
      if (channel instanceof TextChannel) {
        await channel.send({ embeds: [buildEmbed(stream)] });
      } else {
        console.warn(
          `Twitch announcer: channel ${announceChannelId} is not a TextChannel, skipping announcement.`
        );
      }
    }
    wasLive = !!stream;
  } catch (error) {
    console.error('Twitch announcer poll failed:', error);
  }
}

export function start(client: Client): void {
  validateConfig();
  const intervalMs = config.twitch.pollIntervalSeconds * 1000;
  console.log(
    `Twitch announcer: polling ${config.twitch.streamerUsername} every ${config.twitch.pollIntervalSeconds}s`
  );
  void pollOnce(client);
  timer = setInterval(() => void pollOnce(client), intervalMs);
}

export function stop(): void {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
  wasLive = false;
}
