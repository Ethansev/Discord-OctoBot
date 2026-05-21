import { Events } from 'discord.js';
import { Client } from './Client.js';
import { config } from './config.js';
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

  try {
    await client.login(config.discord.token);
  } catch (error) {
    console.error('Error logging in:', error);
    process.exit(1);
  }
}

run();
