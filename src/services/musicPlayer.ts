import { Client, TextChannel } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';
import { log } from '../utility/logger.js';

interface QueueMetadata {
  channel?: TextChannel;
}

let playerInstance: Player | undefined;
let initPromise: Promise<Player> | undefined;

export async function initMusicPlayer(client: Client): Promise<Player> {
  if (playerInstance) return playerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // discord-player ships CJS .d.ts; under moduleResolution=NodeNext, the
    // discord.js Client type is reached via two resolution modes that TS treats
    // as nominally distinct. Cast through the constructor's own parameter type
    // to bridge them.
    const player = new Player(client as unknown as ConstructorParameters<typeof Player>[0]);
    await player.extractors.loadMulti(DefaultExtractors);
    attachEvents(player);
    log.info('music', `player ready (${player.extractors.size} extractors loaded)`);
    playerInstance = player;
    return player;
  })();

  return initPromise;
}

export function getMusicPlayer(): Player | undefined {
  return playerInstance;
}

function attachEvents(player: Player): void {
  player.events.on('playerStart', (queue, track) => {
    log.info('music', `playerStart: "${track.title}" by ${track.author}`);
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send(`Now playing: **${track.title}**`).catch(() => undefined);
  });

  player.events.on('audioTrackAdd', (queue, track) => {
    log.info('music', `queued: "${track.title}" by ${track.author}`);
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send(`Queued: **${track.title}**`).catch(() => undefined);
  });

  player.events.on('disconnect', (queue) => {
    log.info('music', 'disconnected from voice');
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send('Disconnected from voice.').catch(() => undefined);
  });

  player.events.on('emptyChannel', (queue) => {
    log.info('music', 'voice channel empty, leaving');
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send('Voice channel empty, leaving.').catch(() => undefined);
  });

  player.events.on('error', (queue, error) => {
    log.error('music', 'player error', error);
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send(`Music error: ${error.message}`).catch(() => undefined);
  });

  player.events.on('playerError', (queue, error) => {
    log.error('music', 'track playback error', error);
    const channel = (queue.metadata as QueueMetadata | undefined)?.channel;
    channel?.send(`Track playback error: ${error.message}`).catch(() => undefined);
  });
}
