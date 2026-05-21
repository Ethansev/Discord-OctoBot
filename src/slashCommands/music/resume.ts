import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { SlashCommand } from '../../@types/types.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName('resume').setDescription('Resume paused playback'),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue || !queue.currentTrack) {
      await interaction.reply({ content: 'Nothing is playing.', flags: MessageFlags.Ephemeral });
      return;
    }
    if (!queue.node.isPaused()) {
      await interaction.reply({ content: 'Not paused.', flags: MessageFlags.Ephemeral });
      return;
    }
    queue.node.resume();
    await interaction.reply('Resumed.');
  },
};

export default command;
