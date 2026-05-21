import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { SlashCommand } from '../../@types/types.js';
import { initMusicPlayer } from '../../services/musicPlayer.js';

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a track or add it to the queue')
    .addStringOption((option) =>
      option.setName('query').setDescription('URL or search query').setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember | null;
    const voiceChannel = member?.voice?.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: 'Join a voice channel first.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const query = interaction.options.getString('query', true);
    const player = await initMusicPlayer(interaction.client);

    try {
      // See musicPlayer.ts: NodeNext resolves discord.js types via two modes,
      // so cast at the boundary into discord-player's parameter type.
      const channel = voiceChannel as unknown as Parameters<typeof player.play>[0];
      const { track } = await player.play(channel, query, {
        nodeOptions: {
          metadata: { channel: interaction.channel as TextChannel },
          leaveOnEnd: true,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 30_000,
        },
      });
      await interaction.editReply(`Queued **${track.title}**`);
    } catch (error) {
      console.error('/play failed:', error);
      await interaction.editReply(`Failed to play: ${(error as Error).message}`);
    }
  },
};

export default command;
