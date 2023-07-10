import { Events, Interaction } from 'discord.js';
import { BotEvent } from '../@types/types';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    //@ts-ignore
    const command = interaction.client.slashCommands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        interaction.followUp({
          content: 'There was an error while executing this command! Ethan fucked up somewhere.',
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: 'There was an error while executing this command! Ethan fucked up somewhere.',
          ephemeral: true,
        });
      }
    }
  },
};

export default event;
