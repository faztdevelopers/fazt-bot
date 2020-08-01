// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup, deleteMessage, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import { getPage } from '../../utils/tags';
import TagsEmbed from '../../embeds/tagsEmbed';

export default class Tags implements Command {
  names: Array<string> = ['tags'];
  arguments = '(página)';
  group: CommandGroup = 'general';
  description = 'Lista todos los tags existentes.';

  async onCommand(
    message: Message,
    bot: Client,
    alias: string,
    params: Array<string>
  ): Promise<void> {
    try {
      await message.delete();

      const pageStr: string = params[0];
      const page: number = parseInt(pageStr) || 1;

      const tagsPage = await getPage(page);

      const content = page === 1 ? 'aún no hay tags' : 'esa página no existe';
      if (!tagsPage.tags.length) {
        await deleteMessage(await sendMessage(message, content, alias));
        return;
      }

      const embed = new TagsEmbed(tagsPage);
      await message.channel.send(embed);
    } catch (error) {
      console.error('Tag Command', error);
    }
  }
}
