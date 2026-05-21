import {
  Client as DiscordClient,
  Collection,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SharedSlashCommand,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BotEvent, SlashCommand } from './@types/types.js';
import { config } from './config.js';
import { color } from './utility/textColor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class Client extends DiscordClient {
  readonly commandsPath = path.join(__dirname, 'slashCommands');
  readonly eventsPath = path.join(__dirname, 'events');
  slashCommands: Collection<string, SlashCommand>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel],
    });

    this.slashCommands = new Collection();
  }

  loadAllCommands = async () => {
    console.log('Loading commands...');

    const builders: SharedSlashCommand[] = [];

    const files = readdirSync(this.commandsPath).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js')
    );

    for (const file of files) {
      const mod = await import(path.join(this.commandsPath, file));
      const slashCommand: SlashCommand = mod.default;
      builders.push(slashCommand.command);
      this.slashCommands.set(slashCommand.command.name, slashCommand);
      console.log(`Loaded slash command ${file}`);
    }

    const rest = new REST({ version: '10' }).setToken(config.discord.token);
    console.log(`Registering ${builders.length} application (/) commands...`);

    const data = (await rest.put(Routes.applicationCommands(config.discord.applicationId), {
      body: builders,
    })) as unknown[];

    console.log(`Successfully registered ${data.length} application (/) commands.`);
  };

  loadAllEvents = async () => {
    console.log('Loading events...');

    const files = readdirSync(this.eventsPath).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js')
    );

    for (const file of files) {
      const mod = await import(path.join(this.eventsPath, file));
      const event: BotEvent = mod.default;
      const handler = (...args: unknown[]) => event.execute(...args);
      event.once ? this.once(event.name, handler) : this.on(event.name, handler);
      console.log(color('text', `🌠 Successfully loaded event ${color('variable', event.name)}`));
    }
  };
}
