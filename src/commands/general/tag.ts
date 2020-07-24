// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup, deleteMessage, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import * as Tags from '../../utils/tags';

export default class Tag implements Command {
  names: Array<string> = ['tag', 't'];
  arguments = '(título)';
  group: CommandGroup = 'general';
  description = 'Responde con el contenido del tag si existe.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      await message.delete();
      
      const title: string = params[0];
      if (!title) {
        await deleteMessage(await sendMessage(message, 'debes especificar un título.', alias));
        return;
      }

      const tag = await Tags.getByTitle(title);
      if (!tag) {
        await deleteMessage(await sendMessage(message, 'el tag con ese título no existe.', alias));
        return;
      }

      await message.channel.send(tag.content);
    } catch (error) {
      console.error('Tag Command', error);
    }
  }
}
