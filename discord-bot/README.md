# Discord Bot Boilerplate

![Bun](https://img.shields.io/badge/Bun-v1.1-black)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)
![TypeScript](https://img.shields.io/badge/typescript-v5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Issues](https://img.shields.io/github/issues/DFanso/discord-bot-boilerplate)
![Forks](https://img.shields.io/github/forks/DFanso/discord-bot-boilerplate)
![Stars](https://img.shields.io/github/stars/DFanso/discord-bot-boilerplate)

A boilerplate for building Discord bots using TypeScript, Discord.js, and Bun.

## Table of Contents

- [Discord Bot Boilerplate](#discord-bot-boilerplate)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
  - [Project Structure](#project-structure)
  - [Commands and Events](#commands-and-events)
    - [Example Command (`src/commands/hello.ts`)](#example-command-srccommandshellots)
    - [Example Event (`src/events/ready.ts`)](#example-event-srceventsreadyts)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/DFanso/discord-bot-boilerplate.git
   cd discord-bot-boilerplate
   ```

2. Install the dependencies:
   ```sh
   bun install
   ```

## Configuration

Rename `.env.example` file to `.env` and add your configuration:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
NODE_ENV=development
```

## Usage

To start the bot in development mode (with hot reload):

```sh
bun run dev
```

To start the bot in production mode:

```sh
bun run start:prod
```

To register slash commands:

```sh
bun run deploy
```

To check for type errors:

```sh
bun run typecheck
```

## Project Structure

```
discord-bot-boilerplate/
├── src/
│   ├── commands/
│   │   └── hello.ts
│   ├── events/
│   │   └── ready.ts
│   ├── services/
│   │   └── UserService.ts
│   ├── models/
│   │   └── user.ts
│   ├── dto/
│   │   └── UserDTO.ts
│   ├── utils/
│   │   └── deploy.ts
│   │   └── database.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── nodemon.json
```

- **commands/**: Directory for command files.
- **events/**: Directory for event files.
- **services/**: Directory for additional services.
- **dtos/**: Directory for Data Transfer Objects.
- **utils/**: Directory for utility files, such as database connection.
- **index.ts**: Entry point of the bot.

## Commands and Events

- Commands are stored in the `src/commands` directory and must export a `data` property with command metadata and an `execute` function.
- Events are stored in the `src/events` directory and must export a `name` and `execute` function.

### Example Command (`src/commands/hello.ts`)

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Replies with Hello!'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello!');
  },
};
```

### Example Event (`src/events/ready.ts`)

```typescript
import { Client, Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: Client) {
    console.log(`${client.user?.tag} is online!`);
  },
};
```

## Contributing

Contributions are welcome! Please create a pull request or open an issue to discuss your ideas.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
