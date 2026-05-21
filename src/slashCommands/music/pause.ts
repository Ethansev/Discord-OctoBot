import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { SlashCommand } from '../../@types/types.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName('pause').setDescription('Pause the current track'),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue || !queue.currentTrack) {
      await interaction.reply({ content: 'Nothing is playing.', flags: MessageFlags.Ephemeral });
      return;
    }
    if (queue.node.isPaused()) {
      await interaction.reply({ content: 'Already paused.', flags: MessageFlags.Ephemeral });
      return;
    }
    queue.node.pause();
    await interaction.reply('Paused.');
  },
};

export default command;
