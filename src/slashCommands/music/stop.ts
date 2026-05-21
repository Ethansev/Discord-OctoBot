import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { SlashCommand } from '../../@types/types.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback, clear the queue, and disconnect'),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({ content: 'Nothing is playing.', flags: MessageFlags.Ephemeral });
      return;
    }
    queue.delete();
    await interaction.reply('Stopped playback and cleared the queue.');
  },
};

export default command;
