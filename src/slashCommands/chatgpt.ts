import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { Command, SlashCommand } from '../@types/types';

// should probably move this to env file
const configuration = new Configuration({
  organization: 'org-UObui1CbtZH6VgPFzcceMB0K',
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

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 450,
    });

    console.log('response from openai');
    console.log(response.data);
    await interaction.reply(`Prompt: ${prompt} \n\n Answer: ${response.data.choices[0].text}`);
  },
};

export default command;
