import 'dotenv/config'; //ES6!! 
import axios from 'axios';
import { Client, GatewayIntentBits, ImageFormat} from 'discord.js';
import express, { response } from 'express';

import {quotesData} from './seeds/callOfDutyQuotes.js';

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
    if(msg.author.bot) return;
    //console.log(msg);
    let joel = 240328297483993091;
    // let newInvite = await msg.channel.createInvite({maxAge:0, maxUses:0});
    // let randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];

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

client.on("guildMemberAdd", async member => {
    //this code changes the nickname then finds a specific channel in their guild and sends a message to that channel. 
    //console.log(member);
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    channel ? channel.send(`Hi ${member}. We added ~poo to your name!`) : null;

    //channel.send(`Hi ${member.user.username}. We added ~poo to your name!`);
    //client.channels.cache.get(process.env.BOT_CHANNEL).send(`Hi ${member.user.username}. We added ~poo to your name!`); //hard-coding a channel id
});

client.login(process.env.DISCORD_TOKEN); 

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
}).on('error', err => {
    console.log(err);
}); 