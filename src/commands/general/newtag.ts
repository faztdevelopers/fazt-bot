// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Tags from '../../utils/tags';

export default class NewTag implements Command {
  names: Array<string> = ['newtag'];
  arguments = '(titulo) (contenido)';
  group: CommandGroup = 'general';
  description = 'Crea un nuevo tag';

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
    const content: string = params.slice(1).join(' ');

    if (!title || !content) {
      await message.channel.send('Argumentos inválidos');
      return;
    }

    if (await Tags.hasByTitle(title)) {
      await message.channel.send(
        'El tag ya existe! Por favor eliminalo o usa otro titulo'
      );
      return;
    }

    await Tags.create(title, content);
    await message.channel.send('Tag creado!');
  }
}
