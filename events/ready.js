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
