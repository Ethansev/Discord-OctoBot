import 'dotenv/config';
import axios from 'axios';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import express from 'express';

import { fileURLToPath, pathToFileURL } from 'url';
import path, {dirname} from 'path';
import fs from 'fs';

// await axios.get('https://api.openai.com/v1/models')

// import {quotesData} from '../seeds/callOfDutyQuotes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// const functions = fs.readdirSync('./src/functions').filter(file => file.endsWith('.js'));
// const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
// const commandFolders = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers ],
    partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ]
});

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/', (req, res) => {
    res.sendStatus(200);
});

// client.on("ready", () => {
//     console.log(`I am ready! Logged in as ${client.user.tag}`);
// });
client.once(Events.ClientReady, c => {
    console.log(`I am ready! Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async msg => {
    if(msg.author.bot) return;

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

    if(msg.content.includes(":bettermoyai:")) msg.reply("<:othermoyai:1004468892334297148>");
    if(msg.content.includes(":othermoyai:")) msg.reply("<:bettermoyai:1004470188877561977>");
    if(msg.content.includes("🗿")) msg.reply("fuck off");

    // can probably turn this into a hashmap to make it O(n) instead of (On^2)
    const yourMom = ['mommy', 'mother', 'mama', 'momma', 'mom', 'mamma', 'mum'];
    for(let word of msg.content.split(' ')){
        for(let val of yourMom){
            if(word.toLowerCase() === val){
                let getYourMomJoke = async () => {
                    let response = await axios.get(`https://api.yomomma.info/`);
                    let joke = response.data.joke;
                    return joke;
                }
                let jokeValue = await getYourMomJoke();
                console.log(jokeValue);
                msg.reply(jokeValue);
                return;
            }    
        }
    }
}); 

//this code changes the nickname then finds a specific channel in their guild and sends a message to that channel. 
client.on("guildMemberAdd", async member => {
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    channel ? channel.send(`Hi ${member}. We added ~poo to your name!`) : null;

    //channel.send(`Hi ${member.user.username}. We added ~poo to your name!`);
    //client.channels.cache.get(process.env.BOT_CHANNEL).send(`Hi ${member.user.username}. We added ~poo to your name!`); //hard-coding a channel id
});


// Slash Commands go here

// (async () => {
//   for(file of functions) {
//     require(`./functions/${file}`)(client);
//   }
//   client.handleEvents(eventFiles, './src/events');
//   client.handleCommands(commandFolders, './src/commands');
//   client.login(process.env.DISCORD_TOKEN);
// })

client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const {default: command} = await import(pathToFileURL(filePath));

  // set a new item in the collection with the key as the command name and the value as the exported module. 
  if('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.}`)
  }
}

client.on(Events.InteractionCreate, async interaction => {
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
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(process.env.DISCORD_TOKEN); 

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
}).on('error', err => {
    console.log(err);
}); 