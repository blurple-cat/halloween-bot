// Originally written by: https://github.com/Neppkun
// Optimized by: https://github.com/VoltrexKeyva
// This file is the optimized version of the original file.

import { readFileSync, writeFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { setTimeout as setPromisedTimeout } from 'node:timers/promises';

const candyDropMessageIds = [];
let candyDropAvailable = true;

export default {
  data: {
    name: 'claim',
    description: 'Claim the current active candy drop.'
  },
  /**
   * @param {import('../index').Client} _
   * @param {import('discord.js').CommandInteraction} interaction
   */
  async execute(_, interaction) {
    if (!candyDropAvailable) {
      await interaction.reply({
        content: 'There is no candy drop active.',
        ephemeral: true
      });

      return;
    }

    candyDropAvailable = false;

    const candies = JSON.parse(readFileSync('candyCount.json', 'utf-8'));
    candies[interaction.user.id] = (candies[interaction.user.id] ?? 0) + 1;

    writeFileSync('candyCount.json', JSON.stringify(candies, null, 2));

    const candyCount = candies[interaction.user.id];

    await interaction.reply({
      content: `You claimed the candy!\nYou now have ${candyCount.toLocaleString()} cand${
        candyCount === 1 ? 'y' : 'ies'
      }.`
    });
    await setPromisedTimeout(5_000);
    await interaction.deleteReply().catch(() => null);

    for (const candyDropMessageId of candyDropMessageIds)
      await interaction.channel.messages
        .delete(candyDropMessageId)
        .catch(() => null);

    const timeout = randomInt(20, 21) * 1_000;
    await setPromisedTimeout(timeout);

    candyDropAvailable = true;

    const candyDropMessageId = await interaction.channel
      .send({ content: 'Candy drop active!' })
      .then((message) => message.id);

    candyDropMessageIds.push(candyDropMessageId);
  }
};
