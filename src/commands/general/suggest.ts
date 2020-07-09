// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, GuildChannel, TextChannel, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import SuggestionEmbed from '../../embeds/suggestionEmbed';

export default class Suggest implements Command {
  names: Array<string> = ['sugerencia', 'suggestion'];
  arguments = '(mensaje)';
  group: CommandGroup = 'general';
  description = 'Realiza una nueva sugerencia para el servidor.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      const channelID: string = (await getByName('suggestion_channel'))?.value || '';
      if (!channelID.length) {
        return;
      }

      const suggestionChannel: GuildChannel | undefined = message.guild.channels.cache.get(channelID);
      if (!suggestionChannel || !((o: GuildChannel): o is TextChannel => o.type === 'text')) {
        return;
      }

      await message.delete();

      const msg: string = params.slice(1).join(' ');
      if (!msg) {
        await deleteMessage(await sendMessage(message, 'la sugerencia está vacía.', params[0]));
        return;
      }

      const embedMessage = await (suggestionChannel as TextChannel).send(new SuggestionEmbed(msg, message.author));

      deleteMessage(await sendMessage(message, `Tu sugerencia se ha enviado a ${(suggestionChannel as TextChannel)}.`, params[0]));

      await embedMessage.react(bot.emojis.cache.find((e) => e.name === 'check_2') || '');
      await embedMessage.react(bot.emojis.cache.find((e) => e.name === 'x2') || '');
    } catch (error) {
      console.error('Suggest error', error);
    }
  }
}
