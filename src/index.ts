import 'dotenv/config';
import { Events } from 'discord.js';
import { Client } from './Client.js';

run();

async function run() {
  const client = new Client(process.env.DISCORD_TOKEN, process.env.BOT_CHANNEL);

  await client.loadAllEvents();
  await client.loadAllCommands();

  client.once(Events.ClientReady, (c) => {
    console.log(`I am ready! Logged in as ${client.user!.tag}`);
  });

  try {
    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.log(`Error logging in: ${error}`);
  }
}
