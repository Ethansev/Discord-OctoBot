import { Events, Interaction, Message } from 'discord.js';
import { BotEvent } from '../@types/types';
import axios from 'axios';

const event: BotEvent = {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    // probably worth splitting these into separate functions

    // kicks Joel every time he messages in chat
    // let joel = 240328297483993091;
    // if(msg.author.id == joel && msg.system === false){
    //     await msg.author.send({files: ["./media/Ether_Griffguyen.png"]});
    //     await msg.author.send(`fuck you Joel ${newInvite}`);
    //     const member = msg.guild.members.cache.get(msg.author.id);
    //     const channel = msg.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    //     channel ? channel.send(`"*${randomQuote.quote}*" - ${randomQuote.author} \n\n**Joel got dicked :)**`) : null;
    //     member.kick();
    // }

    if (message.content.includes(':bettermoyai:'))
      message.reply('<:othermoyai:1004468892334297148>');
    if (message.content.includes(':othermoyai:'))
      message.reply('<:bettermoyai:1004470188877561977>');
    if (message.content.includes('🗿')) message.reply('fuck off');

    const yourMom = new Set(['mommy', 'mother', 'mama', 'momma', 'mom', 'mamma', 'mum']);
    for (let word of message.content.split(' ')) {
      if (yourMom.has(word.toLowerCase())) {
        const getYourMomJoke = async () => {
          const response = await axios.get(`https://api.yomomma.info/`);
          const joke = response.data.joke;
          return joke;
        };
        const jokeValue = await getYourMomJoke();
        console.log(jokeValue);
        message.reply(jokeValue);
        return;
      }
    }
  },
};

export default event;
