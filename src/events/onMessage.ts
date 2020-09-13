// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message, Client } from 'discord.js';
import Command from '../commands/command';
import { getByName as settingName } from '../utils/settings';
import onOtherLangs from './onOtherLangs';

const onMessage = async (message: Message, bot: Client, prefix: string, commandsCache: Array<Command>): Promise<void> => {
  if (!message.guild || message.author.bot) {
    return;
  }

  if (!message.content.startsWith(prefix)) {
    const otherLangsID: string = (await settingName('others_langs_channel'))?.value || '';
    if (otherLangsID && message.channel.id === otherLangsID) {
      onOtherLangs(message);
      return;
    }

    return;
  }

  const params: string[] = message.content.slice(prefix.length).split(' ');
  if (commandsCache.length && params.length) {
    for await (const command of commandsCache) {
      if (command.names.includes((params[0] || '').toLowerCase())) {
        await command.onCommand(message, bot, params.shift() || '', params);
      }
    }
  }
};

export default onMessage;
