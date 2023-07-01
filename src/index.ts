import "dotenv/config";
import axios from "axios";
import {
  // Client,
  GatewayIntentBits,
  Events,
  Collection,
  // Partials,
  TextChannel,
} from "discord.js";
// import express from "express";

// import { fileURLToPath, pathToFileURL } from "url";
// import path from "path";
import * as fs from "fs";
import { Client } from "./Client";

run();
async function run() {
  // const __dirname = dirname(fileURLToPath(import.meta.url));

  const dev: boolean = process.argv[0].endsWith("ts-node");
  const commandPaths: string = dev ? "src/commands" : "dist/src/commands";
  const eventsPath: string = dev ? "src/events" : "dist/src/events";
  const client = new Client(
    commandPaths,
    eventsPath,
    process.env.DISCORD_TOKEN,
    process.env.BOT_CHANNEL
  );

  // const app = express();
  // const PORT = process.env.PORT || 3000;

  // app.post("/", (req, res) => {
  //   res.sendStatus(200);
  // });

  client.once(Events.ClientReady, c => {
    console.log(`I am ready! Logged in as ${client.user!.tag}`);
  });

  client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    // let newInvite = await msg.channel.createInvite({maxAge:0, maxUses:0});

    // let joel = 240328297483993091;
    // if(msg.author.id == joel && msg.system === false){
    //     await msg.author.send({files: ["./media/Ether_Griffguyen.png"]});
    //     await msg.author.send(`fuck you Joel ${newInvite}`);
    //     const member = msg.guild.members.cache.get(msg.author.id);
    //     const channel = msg.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    //     channel ? channel.send(`"*${randomQuote.quote}*" - ${randomQuote.author} \n\n**Joel got dicked :)**`) : null;
    //     member.kick();
    // }

    if (msg.content.includes(":bettermoyai:"))
      msg.reply("<:othermoyai:1004468892334297148>");
    if (msg.content.includes(":othermoyai:"))
      msg.reply("<:bettermoyai:1004470188877561977>");
    if (msg.content.includes("🗿")) msg.reply("fuck off");

    // can probably turn this into a hashmap to make it O(n) instead of (On^2)
    const yourMom = new Set([
      "mommy",
      "mother",
      "mama",
      "momma",
      "mom",
      "mamma",
      "mum",
    ]);
    for (let word of msg.content.split(" ")) {
      if (yourMom.has(word.toLowerCase())) {
        const getYourMomJoke = async () => {
          const response = await axios.get(`https://api.yomomma.info/`);
          const joke = response.data.joke;
          return joke;
        };
        const jokeValue = await getYourMomJoke();
        console.log(jokeValue);
        msg.reply(jokeValue);
        return;
      }
    }
  });

  client.on("guildMemberAdd", async member => {
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find(
      ch => ch.name === "bot-commands"
    );
    // voice channels do not have a send() method so we need to specify the channel type
    channel
      ? (channel as TextChannel).send(
          `Hi ${member}. We added ~poo to your name!`
        )
      : null;
  });

  // Slash Commands go here - moved to Clien.ts
  // let commands = new Collection();
  // const commandsPath = path.join(__dirname, "commands");
  // const commandFiles = fs
  //   .readdirSync(commandsPath)
  //   .filter((file: string) => file.endsWith(".js"));

  // for (const file of commandFiles) {
  //   const filePath = path.join(commandsPath, file);
  //   // const { default: command } = await import(filePath);
  //   const command = await import(filePath);

  //   if ("data" in command && "execute" in command) {
  //     // @ts-ignore // TODO: Fix Types
  //     commands.set(command.data.name, command);
  //   } else {
  //     console.log(
  //       `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.}`
  //     );
  //   }
  // }

  // this is giving me a typescript error for some reason :'(
  // client.on(Events.InteractionCreate, async interaction => {
  //   if (!interaction.isChatInputCommand()) return;

  //   const command = interaction.client.commands.get(interaction.commandName);

  //   if (!command) {
  //     console.error(
  //       `No command matching ${interaction.commandName} was found.`
  //     );
  //     return;
  //   }

  //   try {
  //     await command.execute(interaction);
  //   } catch (error) {
  //     console.error(error);
  //     if (interaction.replied || interaction.deferred) {
  //       await interaction.followUp({
  //         content:
  //           "There was an error while executing this command! Ethan fucked up somewhere.",
  //         ephemeral: true,
  //       });
  //     } else {
  //       await interaction.reply({
  //         content:
  //           "There was an error while executing this command! Ethan fucked up somewhere.",
  //         ephemeral: true,
  //       });
  //     }
  //   }
  // });

  try {
    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.log(`Error logging in: ${error}`);
  }

  // app
  //   .listen(PORT, () => {
  //     console.log(`Listening on port ${PORT}`);
  //   })
  //   .on("error", (err: any) => {
  //     console.log(err);
  //   });
}
