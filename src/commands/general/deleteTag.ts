// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Tags from '../../utils/tags';

export default class DeleteTag implements Command {
  names: Array<string> = ['deletetag'];
  arguments = '(titulo)';
  group: CommandGroup = 'general';
  description = 'Elimina un tag por su titulo';

  async onCommand(
    message: Message,
    bot: Client,
    alias: string,
    params: Array<string>
  ): Promise<void> {
    if (!message.guild || !message.member) {
      return;
    }

    const contributorsRole = message.guild.roles.cache.find(
      (role) => role.name === 'Contributors'
    );

    if (!contributorsRole) {
      return;
    }

    if (message.member.roles.highest.position < contributorsRole.position) {
      await message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

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
