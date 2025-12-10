import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const { CLIENT_ID, TOKEN } = process.env;

if (!TOKEN || !CLIENT_ID) {
  throw new Error('Missing TOKEN or CLIENT_ID in environment variables');
}

interface Command {
  data: {
    toJSON: () => any;
  };
}

const commands: any[] = [];
const commandFoldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

(async () => {
  for (const folder of commandFolders) {
    const commandsPath = path.join(commandFoldersPath, folder);

    // Check if the path is a directory before proceeding
    if (fs.statSync(commandsPath).isDirectory()) {
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
      for (const file of commandFiles) {
        const module = await import(path.join(commandsPath, file));
        const command: Command = module.default || module;
        if (command.data) {
          commands.push(command.data.toJSON());
        }
      }
    } else if (commandsPath.endsWith('.ts') || commandsPath.endsWith('.js')) {
      // Handle files directly inside the 'commands' directory
      const module = await import(commandsPath);
      const command: Command = module.default || module;
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data: any = await rest.put(
      Routes.applicationCommands(CLIENT_ID), // Change this line for global commands
      { body: commands },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error(error);
  }
})();
