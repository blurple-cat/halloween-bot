// Originally written by: https://github.com/Neppkun
// Optimized by: https://github.com/VoltrexKeyva
// This file is the optimized version of the original file.

export default {
  name: 'ready',
  once: true,
  /**
   * @param {import('../index').Client} client
   */
  async execute(client) {
    await client.slashHandler.register();

    console.log(`${client.user.tag} is ready for action!`);
  }
};
