import {
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  Client,
  Interaction,
  Events
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: Client) {
    if (
      !interaction.isCommand() &&
      !interaction.isModalSubmit() &&
      !interaction.isButton()
    ) return;

    // Handle command interactions
    if (interaction.isCommand()) {
      try {
        const commandPath = join(__dirname, '../commands', `${interaction.commandName}.ts`);
        const module = await import(commandPath);
        const command = module.default || module;
        await command.execute(interaction as CommandInteraction);
      } catch (error) {
        console.error(error);
        await (interaction as CommandInteraction).reply({
          content: 'An error occurred while executing this command.',
          ephemeral: true
        });
      }
    }
  }
};
