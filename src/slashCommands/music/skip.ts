import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { SlashCommand } from '../../@types/types.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName('skip').setDescription('Skip the current track'),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = useQueue(interaction.guildId!);
    const current = queue?.currentTrack;
    if (!queue || !current) {
      await interaction.reply({ content: 'Nothing is playing.', flags: MessageFlags.Ephemeral });
      return;
    }
    queue.node.skip();
    await interaction.reply(`Skipped **${current.title}**`);
  },
};

export default command;
