import { Events, Interaction, MessageFlags } from 'discord.js';
import type { BotEvent } from '../@types/types.js';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing /${interaction.commandName}:`, error);
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
