import { Events } from 'discord.js';
import { Client } from './Client.js';
import { config } from './config.js';
import { initMusicPlayer } from './services/musicPlayer.js';
import * as twitchAnnouncer from './services/twitchAnnouncer.js';
import { log } from './utility/logger.js';

async function run() {
  const client = new Client();

  await client.loadAllEvents();
  await client.loadAllCommands();

  client.once(Events.ClientReady, (c) => {
    log.info('bot', `I am ready! Logged in as ${c.user.tag} (${c.user.id})`);
  });

  client.on('error', (err) => log.error('bot', 'Discord client error', err));
  client.on('warn', (msg) => log.warn('bot', msg));
  client.on(Events.ShardError, (err, shardId) =>
    log.error('bot', `shard ${shardId} error`, err)
  );
  client.on(Events.ShardDisconnect, (event, shardId) =>
    log.warn('bot', `shard ${shardId} disconnected (code=${event.code}, reason=${event.reason || 'n/a'})`)
  );
  client.on(Events.ShardReconnecting, (shardId) =>
    log.info('bot', `shard ${shardId} reconnecting`)
  );
  client.on(Events.ShardResume, (shardId, replayed) =>
    log.info('bot', `shard ${shardId} resumed (replayed ${replayed} events)`)
  );

  if (config.features.twitchAnnouncer) {
    client.once(Events.ClientReady, () => twitchAnnouncer.start(client));
  }

  if (config.features.music) {
    client.once(Events.ClientReady, () => {
      initMusicPlayer(client).catch((error) => {
        log.error('music', 'failed to initialize music player', error);
      });
    });
  }

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info('bot', `received ${signal}, shutting down...`);
    if (config.features.twitchAnnouncer) twitchAnnouncer.stop();
    client.destroy().finally(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await client.login(config.discord.token);
  } catch (error) {
    log.error('bot', 'login failed', error);
    process.exit(1);
  }
}

run();
