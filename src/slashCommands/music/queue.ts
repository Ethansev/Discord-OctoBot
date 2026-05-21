import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { useQueue } from 'discord-player';
import { SlashCommand } from '../../@types/types.js';

const MAX_LISTED = 10;

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName('queue').setDescription('Show the current music queue'),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({ content: 'Nothing is queued.', flags: MessageFlags.Ephemeral });
      return;
    }

    const upcoming = queue.tracks.toArray().slice(0, MAX_LISTED);
    const lines = upcoming.map((track, i) => `${i + 1}. ${track.title}`);
    const overflow =
      queue.tracks.size > upcoming.length
        ? `\n…and ${queue.tracks.size - upcoming.length} more`
        : '';

    const current = queue.currentTrack;
    const description =
      (current ? `Now playing: **${current.title}**\n\n` : '') +
      (lines.length ? lines.join('\n') + overflow : 'Queue is empty.');

    const embed = new EmbedBuilder().setTitle('Music queue').setDescription(description);
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
