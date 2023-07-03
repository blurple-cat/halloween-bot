// Originally written by: https://github.com/Neppkun
// Optimized by: https://github.com/VoltrexKeyva
// This file is the optimized version of the original file.

const eventName = 'interactionCreate';

export default {
  name: eventName,
  once: false,
  /**
   * @param {import('../index').Client} client
   * @typedef {import('discord.js').ClientEvents[eventName]} Event
   * @param {Event[0]} interaction
   * @returns
   */
  async execute(client, interaction) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (command === undefined) return;

    try {
      await command.execute(client, interaction);
    } catch (err) {
      console.error(
        `An error occured while trying to execute the '${interaction.commandName}' command: ${err.stack}`
      );
    }
  }
};
