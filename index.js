import 'dotenv/config'; //ES6!! 
import { Client, GatewayIntentBits} from 'discord.js';
import express from 'express';
const client = new Client({
    intents:[ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers ],
    partials: [ 'MESSAGE', 'CHANNEL', 'REACTION' ]
});

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/', (req, res) => {
    res.sendStatus(200);
});

client.on("ready", () => {
    console.log(`I am ready! Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async msg => {
    //console.log(msg); for testing purposes
    if (msg.author.bot) return;
    if(msg.content.includes(":bettermoyai:")) msg.reply("<:othermoyai:1004468892334297148>");
    if(msg.content.includes(":othermoyai:")) msg.reply("<:bettermoyai:1004470188877561977>");
    if(msg.content.includes("🗿")) msg.reply("fuck off");
    //if(msg.content.includes("hello")) msg.reply("yes you");
}); 

client.on("guildMemberAdd", async member => {
    console.log(member);
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    channel ? channel.send(`Hi ${member}. We added ~poo to your name!`) : null;
    //channel.send(`Hi ${member.user.username}. We added ~poo to your name!`);
    //client.channels.cache.get(process.env.BOT_CHANNEL).send(`Hi ${member.user.username}. We added ~poo to your name!`);
    //will eventually change this hard-coded channel to a variable
});

client.login(process.env.DISCORD_TOKEN); 

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
}).on('error', err => {
    console.log(err);
}); 