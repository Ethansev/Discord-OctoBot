import { Events } from 'discord.js';
import { Client } from './Client.js';
import { config } from './config.js';
import { initMusicPlayer } from './services/musicPlayer.js';
import * as twitchAnnouncer from './services/twitchAnnouncer.js';

async function run() {
  const client = new Client();

  await client.loadAllEvents();
  await client.loadAllCommands();

  client.once(Events.ClientReady, (c) => {
    console.log(`I am ready! Logged in as ${c.user.tag}`);
  });

  if (config.features.twitchAnnouncer) {
    client.once(Events.ClientReady, () => twitchAnnouncer.start(client));
  }

  if (config.features.music) {
    client.once(Events.ClientReady, () => {
      initMusicPlayer(client).catch((error) => {
        console.error('Failed to initialize music player:', error);
      });
    });
  }

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down...`);
    if (config.features.twitchAnnouncer) twitchAnnouncer.stop();
    client.destroy().finally(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await client.login(config.discord.token);
  } catch (error) {
    console.error('Error logging in:', error);
    process.exit(1);
  }
}

run();
