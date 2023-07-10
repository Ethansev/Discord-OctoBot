import { Client as DiscordClient, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdir, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Command } from './Command';
import { Event } from './@types/types';

export class Client extends DiscordClient {
  commands: Collection<string, Command>;
  slashCommands: Collection<String, Command>;
  // token: string | null;
  GuildId?: string;
  commandsPath: string;
  eventsPath: string;

  public constructor(commandsPath: string, eventsPath: string, token?: string, GuildId?: string) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    this.commandsPath = commandsPath;
    this.eventsPath = eventsPath;

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.token = token || null;
    this.GuildId = GuildId;
  }

  // Load all the commands
  loadAllCommands = () => {
    console.log('Loading commands...');
    readdirSync(this.commandsPath)
      .filter((dir) => statSync(join(this.commandsPath, dir)).isDirectory())
      .forEach(async (dir) => {
        const commandFiles = readdirSync(`${this.commandsPath}/${dir}`).filter(
          (f) => f.endsWith('.ts') || f.endsWith('.js')
        );

        for (const file of commandFiles) {
          const command: Command = await import(`./commands/${dir}/${file}`);
          console.log(`Loaded command ${dir}/${file}`);
          this.commands.set(command.name, command);
        }
      });
  };

  // Load all the events
  loadAllEvents = async () => {
    console.log('Loading events...');
    const eventFiles = readdirSync(this.eventsPath).filter(
      (f) => f.endsWith('.js') || f.endsWith('.ts')
    );
    for (const file of eventFiles) {
      const event: Event = await import(`./events/${file}`);
      const eventFileName = file.split('.')[0];
      const eventName = eventFileName.charAt(0).toLowerCase() + eventFileName.slice(1);
      console.log(`Loaded event ${eventName}`);
      this.on(eventName, (...args: unknown[]) => {
        event.run(args);
      });
    }
  };

  handleInteraction = async (interaction: any) => {
    // update type for interaction
    console.log('Handling interaction');

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command! Ethan fucked up somewhere.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command! Ethan fucked up somewhere.',
          ephemeral: true,
        });
      }
    }
  };
}
