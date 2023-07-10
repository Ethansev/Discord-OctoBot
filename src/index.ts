import 'dotenv/config';
import axios from 'axios';
import { GatewayIntentBits, Events, Collection, TextChannel } from 'discord.js';
import { Client } from './Client.js';

run();
async function run() {
  // const __dirname = dirname(fileURLToPath(import.meta.url));

  const dev: boolean = process.argv[0].endsWith('ts-node');
  const commandPaths: string = dev ? 'src/commands' : 'dist/commands';
  const eventsPath: string = dev ? 'src/events' : 'dist/events';

  const client = new Client(
    commandPaths,
    eventsPath,
    process.env.DISCORD_TOKEN,
    process.env.BOT_CHANNEL
  );

  client.once(Events.ClientReady, (c) => {
    console.log(`I am ready! Logged in as ${client.user!.tag}`);
  });

  client.loadAllCommands();
  client.loadAllEvents();

  client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    // let joel = 240328297483993091;
    // if(msg.author.id == joel && msg.system === false){
    //     await msg.author.send({files: ["./media/Ether_Griffguyen.png"]});
    //     await msg.author.send(`fuck you Joel ${newInvite}`);
    //     const member = msg.guild.members.cache.get(msg.author.id);
    //     const channel = msg.guild.channels.cache.find(ch => ch.name === 'bot-commands');
    //     channel ? channel.send(`"*${randomQuote.quote}*" - ${randomQuote.author} \n\n**Joel got dicked :)**`) : null;
    //     member.kick();
    // }

    if (msg.content.includes(':bettermoyai:')) msg.reply('<:othermoyai:1004468892334297148>');
    if (msg.content.includes(':othermoyai:')) msg.reply('<:bettermoyai:1004470188877561977>');
    if (msg.content.includes('🗿')) msg.reply('fuck off');

    const yourMom = new Set(['mommy', 'mother', 'mama', 'momma', 'mom', 'mamma', 'mum']);
    for (let word of msg.content.split(' ')) {
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

  client.on('guildMemberAdd', async (member) => {
    member.setNickname(`${member.user.username}poo`);
    const channel = member.guild.channels.cache.find((ch) => ch.name === 'bot-commands');
    // voice channels do not have a send() method so we need to specify the channel type
    channel ? (channel as TextChannel).send(`Hi ${member}. We added ~poo to your name!`) : null;
  });

  client.on(Events.InteractionCreate, async (interaction) => client.handleInteraction(interaction));

  try {
    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.log(`Error logging in: ${error}`);
  }
}
