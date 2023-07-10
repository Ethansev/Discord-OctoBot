import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { SlashCommand } from '../@types/types';

// should probably move this to env file
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Give any prompt and let AI respond.')
    .addStringOption((option) =>
      option.setName('prompt').setDescription('The user to ping').setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    // could create a new interface instead of using any

    const prompt = (interaction.options as any).getString('prompt');
    const openai = new OpenAIApi(configuration);

    await interaction.deferReply();

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 450,
      });

      // there are rarely more than one answer from chatgpt but just in case
      let replyText = `Prompt: ${prompt} \n\n`;
      response.data.choices.map((choice, index) => {
        const content = (choice.message && choice.message.content) || '';
        replyText = replyText.concat(`Answer ${index + 1}: ${content} \n\n`);
      });

      await interaction.editReply(replyText);
    } catch (error: any) {
      interaction.reply('Oh no we made an oopsie woopsie. 30 minute lunch break brb');
      console.log(error.message);
    }
  },
};

export default command;
