import { Client, GatewayIntentBits } from "discord.js";
import fs from "fs";
import path from "path";
import { createApi } from "./api";

import { getEnvOrThrow } from "./libs/env";

const TOKEN = getEnvOrThrow("TOKEN");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.AutoModerationExecution,
  ],
});

// Dynamically read event files
const eventFiles = fs
  .readdirSync(path.join(__dirname, "events"))
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

(async () => {
  for (const file of eventFiles) {
    const filePath = path.join(__dirname, "events", file);
    const module = await import(filePath);
    const event = module.default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  await client.login(TOKEN);

  const api = createApi(client);
  api.listen(3001);
  console.log("API listening on port 3001");
})();
