// import dotenv from "dotenv";
// import { ApplicationCommand, REST, Routes } from "discord.js";

// import { fileURLToPath } from "url";
// import path, { dirname } from "path";
// import fs from "fs";

// async function deployCommands() {
//   const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
//   const commands = await setupCommands(); //TODO: give commands proper typing
//   await postCommands(rest, commands);
// }

// async function setupCommands() {
//   const __dirname = dirname(fileURLToPath(import.meta.url));

//   const envPath = path.resolve(__dirname, "../.env");
//   dotenv.config({ path: envPath });

//   const commands = [];
//   const commandsPath = path.join(__dirname, "commands");
//   const commandFiles = fs
//     .readdirSync(commandsPath)
//     .filter(file => file.endsWith(".js"));

//   for (const file of commandFiles) {
//     const { default: command } = await import(`./commands/${file}`);
//     commands.push(command.data.toJSON());
//   }

//   return commands;
// }

// async function postCommands(rest: REST, commands: any[]) {
//   try {
//     console.log(
//       `Started refreshing ${commands.length} application (/) commands.`
//     );

//     const data = (await rest.put(
//       Routes.applicationCommands(process.env.APPLICATION_ID!),
//       { body: commands }
//     )) as any; // TODO: Fix typing

//     console.log(
//       `Successfully reloaded ${data.length} application (/) commands.`
//     );
//   } catch (error) {
//     console.log("Sometihng went wrong!");
//     console.error(error);
//   }
// }
