import dotenv from 'dotenv';

dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import SlashHandler from './slash-handler.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.slashHandler = new SlashHandler(client, './commands');

if (existsSync('events'))
  await (async function loadEvents(dir) {
    for (const file of readdirSync(dir)) {
      const path = join(dir, file);

      if (lstatSync(path).isDirectory()) await loadEvents(path);
      else if (file.endsWith('.js')) {
        const { default: event } = await import(pathToFileURL(path));

        client[event.once ? 'once' : 'on'](
          event.name,
          event.run.bind(null, client)
        );
      }
    }
  })('events');

await client.login(process.env.TOKEN);
