import { Client, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`${client.user?.tag} is online!`);
  },
};
