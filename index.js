import { Client, GatewayIntentBits} from 'discord.js';
//import express from 'express';
const client = new Client({
    intents:[ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers ],
    partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ]
});
import 'dotenv/config'; //ES6!! 

//const app = express();
//const PORT = process.env.PORT || 3000;

client.on("ready", () => {
    console.log(`I am ready! Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async msg => {
    //console.log(msg);
    //if (msg.author.client) return;
    if(msg.content.includes(":bettermoyai:")) {
        msg.reply('othermoyai:853487746433286145');
    }
});

client.on("guildMemberAdd", async member => {
    member.setNickname(`${member.user.username}poo`);
    client.channels.cache.get('908622072744407050').send(`Hi ${member.user.username}. We added ~poo to your name!`);
});

client.login(process.env.DISCORD_TOKEN); 