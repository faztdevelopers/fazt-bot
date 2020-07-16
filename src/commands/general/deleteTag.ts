// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Tags from '../../utils/tags';

export default class DeleteTag implements Command {
  names: Array<string> = ['deletetag'];
  group: CommandGroup = 'general';
  description = 'Deletes a tag by its title';

  async onCommand(
    message: Message,
    bot: Client,
    alias: string,
    params: Array<string>
  ): Promise<void> {
    const title: string = params[0];

    if (!title) {
      await message.channel.send('Debes especificar un titulo');
      return;
    }

    if (await Tags.hasByTitle(title)) {
      await Tags.deleteByTitle(title);
      await message.channel.send('Tag eliminado');
      return;
    }

    await message.channel.send('El tag con ese titulo no fue encontrado.');
  }
}
