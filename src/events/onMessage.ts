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

  const msg: string = message.content.slice(prefix.length);
  if (commandsCache.length) {
    for await (let command of commandsCache) {
      if (command.format.test(msg)) {
        await command.onCommand(message, bot, msg.match(command.format)?.groups || {})
      }
    }
  }
};

export default onMessage;
