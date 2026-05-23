import { Events, Interaction, MessageFlags } from 'discord.js';
import type { BotEvent } from '../@types/types.js';
import { log } from '../utility/logger.js';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);
    if (!command) {
      log.warn('cmd', `no command matching /${interaction.commandName} was found`);
      return;
    }

    const where = interaction.guild ? `guild ${interaction.guild.name}` : 'DM';
    log.info(
      'cmd',
      `/${interaction.commandName} invoked by ${interaction.user.tag} (${interaction.user.id}) in ${where}`
    );

    const start = Date.now();
    try {
      await command.execute(interaction);
      log.info('cmd', `/${interaction.commandName} ok (${Date.now() - start}ms)`);
    } catch (error) {
      log.error('cmd', `/${interaction.commandName} failed (${Date.now() - start}ms)`, error);
      const content =
        'There was an error while executing this command! Ethan fucked up somewhere.';
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
      }
    }
  },
};

export default event;
