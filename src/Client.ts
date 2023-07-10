import {
  Client as DiscordClient,
  Collection,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'fs';
import { BotEvent, SlashCommand } from './@types/types';
import { color } from './utility/textColor.js';

export class Client extends DiscordClient {
  slashCommands: Collection<String, SlashCommand>;
  // token: string | null;
  GuildId?: string;
  commandsPath: string;
  eventsPath: string;
  cooldowns?: Collection<string, number>;

  public constructor(token?: string, GuildId?: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    this.commandsPath = 'src/slashCommands';
    this.eventsPath = 'src/events';

    this.slashCommands = new Collection();
    this.token = token || null;
    this.GuildId = GuildId;
    this.cooldowns = new Collection<string, number>();
  }

  // Eventually move to these to their own classes

  loadAllCommands = async () => {
    console.log('Loading commands...');

    const slashCommands: SlashCommandBuilder[] = [];
    // looping through commands folder for each file which contains a Command object
    const filePromises = readdirSync(this.commandsPath).map(async (file) => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        await import(`./slashCommands/${file}`).then(async (commandObject) => {
          const command: SlashCommand = commandObject.default;
          slashCommands.push(command.command);
          this.slashCommands.set(command.command.name, command);
          console.log(`Loaded slash command ${file}`);
        });
      }
    });

    try {
      await Promise.all(filePromises);
      console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
      const data = (await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID!), {
        body: slashCommands,
      })) as any;

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.log('Something went wrong!');
      console.error(error);
    }
  };

  loadAllEvents = async () => {
    console.log('Loading events...');

    const eventFiles = readdirSync(this.eventsPath).filter(
      (f) => f.endsWith('.js') || f.endsWith('.ts')
    );

    for (const file of eventFiles) {
      // TODO: make the import better
      await import(`../${this.eventsPath}/${file}`).then((eventObject) => {
        const event: BotEvent = eventObject.default;
        event.once
          ? this.once(event.name, (...args) => event.execute(...args))
          : this.on(event.name, (...args) => event.execute(...args));

        console.log(color('text', `🌠 Successfully loaded event ${color('variable', event.name)}`));
      });
    }
  };
}
