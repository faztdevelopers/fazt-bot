// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { config } from 'dotenv';
import { Client } from 'discord.js';
import Command from './commands/command';
import Commands from './commands';
import { connect } from './database';
import events from './events';

// Load .env file
config();

// Initialize the bot
export const prefix: string = process.env.PREFIX || '!';
export const bot: Client = new Client({ partials: ['REACTION', 'MESSAGE', 'REACTION'] });
export const commandsCache: Array<Command> = Commands;

// On channel message
bot.on('message', async (message) => await events.onMessage(message, bot, prefix, commandsCache));

// On new member
bot.on('guildMemberAdd', async (member) => await events.onNewMember(member, bot));

// On reaction add
bot.on('messageReactionAdd', async (reaction, user) => await events.onReaction('add', reaction, user, bot));

// On reaction remove
bot.on('messageReactionRemove', async (reaction, user) => await events.onReaction('remove', reaction, user, bot));

// On ready event
bot.on('ready', () => events.onReady(bot, prefix));

// Initialize
(async () => {
  // Connect to the database
  await connect();

  // Bot login
  await bot.login(process.env.TOKEN || '');
})();
