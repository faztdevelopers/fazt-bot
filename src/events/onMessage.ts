// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message, Client } from 'discord.js';
import Command from '../commands/command';
import onMention from './onMention';
import { getByName as settingName } from '../utils/settings';
import onOtherLangs from './onOtherLangs';

const onMessage = async (message: Message, bot: Client, prefix: string, commandsCache: Array<Command>): Promise<void> => {
  if (!message.guild || message.author.bot) {
    return;
  }

  if (!message.content.startsWith(prefix)) {
    if (bot.user && message.content.match(new RegExp(`<@!?${bot.user.id}>`, 'gi'))) {
      onMention(message);
      return;
    }

    const otherLangsID: string = (await settingName('others_langs_channel'))?.value || '';
    if (otherLangsID && message.channel.id === otherLangsID) {
      onOtherLangs(message);
      return;
    }

    return;
  }

  const params: string[] = message.content.slice(prefix.length).split(' ');
  const alias: string = params[0];
  const args: string[] = params.slice(1);
  if (commandsCache.length) {
    for await (const command of commandsCache) {
      if (command.names.includes(params[0].toLowerCase())) {
        await command.onCommand(message, bot, args, alias);
      }
    }
  }
};

export default onMessage;
