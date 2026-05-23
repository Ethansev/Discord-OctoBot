import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../@types/types.js';
import { chatComplete } from '../services/openai.js';
import { log } from '../utility/logger.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('chatgpt')
    .setDescription('Give any prompt and let AI respond.')
    .addStringOption((option) =>
      option.setName('prompt').setDescription('The prompt to send').setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const prompt = interaction.options.getString('prompt', true);

    await interaction.deferReply();

    try {
      const answer = await chatComplete(prompt);
      await interaction.editReply(`**Prompt:** ${prompt}\n\n${answer}`);
    } catch (error) {
      log.error('cmd', 'chatgpt openai call failed', error);
      await interaction.editReply({
        content: 'Oh no we made an oopsie woopsie. 30 minute lunch break brb',
      });
    }
  },
};

export default command;
