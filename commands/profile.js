import { readFileSync } from 'node:fs';

export default {
  data: {
    name: 'profile',
    description: 'Shows how much candy you have.'
  },
  /**
   * @param {import('../index').Client} _
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(_, interaction) {
    const candies = JSON.parse(readFileSync('candyCount.json', 'utf-8'));
    const candyCount = candies[interaction.user.id] ?? 0;

    await interaction.reply({
      content: `You have ${candyCount.toLocaleString()} cand${
        candyCount === 1 ? 'y' : 'ies'
      }.`
    });
  }
};
