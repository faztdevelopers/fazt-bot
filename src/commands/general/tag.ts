// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Tags from '../../utils/tags';

export default class Tag implements Command {
  names: Array<string> = ['tag', 't'];
  group: CommandGroup = 'general';
  description = 'Responde con el contenido del tag si existe';

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

    const tag = await Tags.getByTitle(title);

    if (!tag) {
      await message.channel.send('El tag con ese titulo no existe');
      return;
    }

    await message.channel.send(tag.content);
  }
}
