import {
  Client as DiscordClient,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { readdir, readdirSync, statSync } from "fs";
import { join } from "path";
import { Command } from "./Command";
import { Event } from "./Event";

export class Client extends DiscordClient {
  commands: Collection<string, Command>;
  slashCommands: Collection<String, Command>;
  // token: string | null = "";
  GuildId?: string;

  public constructor(
    commandsPath: string,
    eventsPath: string,
    token?: string,
    GuildId?: string
  ) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.token = token || null;
    this.GuildId = GuildId;

    // Load all the commands
    const loadAllCommands = () => {
      readdirSync(commandsPath)
        .filter(dir => statSync(join(commandsPath, dir)).isDirectory())
        .forEach(async dir => {
          const commandFiles = readdirSync(`${commandsPath}/${dir}`).filter(
            f => f.endsWith(".ts") || f.endsWith(".js")
          );

          for (const file of commandFiles) {
            // const FoundCommand = require(`./commands/${dir}/${file}`).default;
            const FoundCommand = await import(`./commands/${dir}/${file}`);
            const command: Command = new FoundCommand(this);
            console.log(`Loaded command ${dir}/${file}`);
            this.commands.set(command.name, command);
          }
        });
    };

    // Load all the events
    const loadAllEvents = async () => {
      const eventFiles = readdirSync(eventsPath).filter(
        f => f.endsWith(".js") || f.endsWith(".ts")
      );
      for (const file of eventFiles) {
        // const FoundEvent = require(`./events/${file}`);
        const FoundEvent = await import(`./events/${file}`);
        const event: Event = new FoundEvent(this);
        const eventFileName = file.split(".")[0];
        const eventName =
          eventFileName.charAt(0).toLowerCase() + eventFileName.slice(1);
        console.log(`Loaded event ${eventName}`);
        this.on(eventName, (...args: unknown[]) => {
          event.run(args);
        });
      }
    };
  }
}
