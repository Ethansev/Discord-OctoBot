import 'dotenv/config';
import { Events } from 'discord.js';
import { Client } from './Client.js';

run();

async function run() {
  // const dev: boolean = process.env.NODE_ENV === 'development';
  // const commandPaths: string = dev ? 'src/slashCommands' : 'dist/slashCommands';
  // const eventsPath: string = dev ? 'src/events' : 'dist/events';

  const commandPaths: string = 'src/slashCommands';
  const eventsPath: string = 'src/events';

  const client = new Client(
    commandPaths,
    eventsPath,
    process.env.DISCORD_TOKEN,
    process.env.BOT_CHANNEL
  );

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
