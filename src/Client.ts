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
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Message, Partials.Channel],
    });

    this.slashCommands = new Collection();
  }

  private loadCommandsFrom = async (dir: string, label: string): Promise<SharedSlashCommand[]> => {
    const entries = readdirSync(dir, { withFileTypes: true }).filter(
      (entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))
    );
    const builders: SharedSlashCommand[] = [];
    for (const entry of entries) {
      const mod = await import(path.join(dir, entry.name));
      const slashCommand: SlashCommand = mod.default;
      builders.push(slashCommand.command);
      this.slashCommands.set(slashCommand.command.name, slashCommand);
      console.log(`Loaded slash command ${label}/${entry.name}`);
    }
    return builders;
  };

  loadAllCommands = async () => {
    console.log('Loading commands...');

    const builders: SharedSlashCommand[] = [];
    builders.push(...(await this.loadCommandsFrom(this.commandsPath, 'slashCommands')));

    if (config.features.music) {
      const musicDir = path.join(this.commandsPath, 'music');
      builders.push(...(await this.loadCommandsFrom(musicDir, 'slashCommands/music')));
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
