// Written by: https://github.com/VoltrexKeyva

import { Client, Collection } from 'discord.js';
import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const formatter = new Intl.ListFormat('en');
const delimiter = process.platform === 'win32' ? '\\' : '/';

class SlashHandler {
  #cwd = process.cwd();
  /**
   * The slash-command handler constructor.
   *
   * @constructor
   * @param {Client} client The discord.js client instance.
   * @param {string} [commandsPath] The path to the directory to load slash-commands from.
   */
  constructor(client, commandsPath = join(this.#cwd, 'commands')) {
    if (!(client instanceof Client))
      throw new TypeError(
        "The 'client' argument must be a discord.js client instance."
      );

    if (typeof commandsPath !== 'string')
      throw new TypeError("The 'commandsPath' argument must be a string.");

    client.commands = new Collection();
    client.guildCommands = new Collection();
    this.client = client;

    this.#load(commandsPath, this.client.commands, this.client.guildCommands);
  }

  /**
   * Registers all of the slash-commands loaded, updates them if updated, deletes them if deleted.
   *
   * @async
   * @returns {Promise<void>}
   */
  async register() {
    if (this.client.commands.size === 0 && this.client.guildCommands.size === 0)
      return console.warn('No slash-commands loaded to register.');

    if (this.client.guildCommands.size !== 0)
      for (const [guildId, commands] of this.client.guildCommands) {
        if (!this.client.guilds.cache.has(guildId)) {
          console.warn(
            `Guild with the ID of '${guildId}' not found to register the following slash-commands to: ${formatter.format(
              [...commands.keys()]
            )}`
          );

          continue;
        }

        await this.client.guilds.cache
          .get(guildId)
          .commands.set(commands.map((command) => command.data))
          .catch((err) =>
            console.warn(
              `Failed to register slash-commands to guild '${guildId}' due to an err:\n${err.stack}`
            )
          );
      }

    if (this.client.commands.size !== 0)
      await this.client.application?.commands
        .set(this.client.commands.map((command) => command.data))
        .catch((err) =>
          console.warn(
            `Failed to register global slash-commands due to an error:\n${err.stack}`
          )
        );
  }

  async #load(path, commands, guildCommands) {
    if (!existsSync(path))
      throw new Error(`Path '${path}' not found to load slash-commands from.`);

    if (!lstatSync(path).isDirectory())
      throw new TypeError(`'${path}' is not a directory.`);

    if (readdirSync(path).length === 0)
      return console.warn(
        `'${path}' is an empty directory, cannot load slash-commands from an empty directory`
      );

    if (path.endsWith(delimiter)) path = path.slice(0, -1);

    await this.#loadCommands(join(this.#cwd, path), commands, guildCommands);
  }

  async #loadCommands(path, commands, guildCommands) {
    if (lstatSync(path).isDirectory())
      for (const entry of readdirSync(path))
        await this.#loadCommands(join(path, entry), commands, guildCommands);
    else if (path.endsWith('.js')) {
      const parts = path.split(delimiter);
      const entry = parts.pop();

      await this.#loadCommand(
        parts.join(delimiter),
        entry,
        commands,
        guildCommands
      );
    }
  }

  async #loadCommand(path, file, commands, guildCommands) {
    try {
      const { default: command } = await import(
        pathToFileURL(join(path, file))
      );

      if (Array.isArray(command.guildIds) && commands.guildIds.length !== 0)
        for (const guildId of command.guildIds) {
          if (typeof guildId !== 'string') continue;

          if (!guildCommands.has(guildId))
            guildCommands.set(guildId, new Collection());

          guildCommands.get(guildId).set(command.data.name, command);
        }
      else commands.set(command.data.name, command);
    } catch (err) {
      console.error(
        `Failed to load command '${file.slice(0, -3)}' due to an error:\n${
          err.stack
        }`
      );
    }
  }
}

export default SlashHandler;
