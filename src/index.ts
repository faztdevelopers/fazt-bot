import { config } from 'dotenv';
import { Client } from 'discord.js';
import Commands from './commands';

// Load .env file
config();

// Initialize the bot
export const prefix: string = process.env.PREFIX || '!';
export const bot: Client = new Client();

bot.on('message', async (message) => {
  if (!message.guild || message.author.bot) {
    return;
  }

  if (!message.content.startsWith(prefix)) {
    return;
  }

  const msg: string = message.content.slice(prefix.length);
  if (Commands.length) {
    for await (let command of Commands) {
      if (command.format.test(msg.toLowerCase())) {
        await command.execute(message, msg.match(command.format)?.groups || {})
      }
    }
  }
});

bot.on('ready', () => {
  console.log(`Bot logged as ${bot.user?.username}`);
  bot.user?.setActivity('!help');
});

bot.login(process.env.TOKEN || '');
