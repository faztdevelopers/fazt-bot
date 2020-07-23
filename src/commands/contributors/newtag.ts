// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup, deleteMessage, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import * as Tags from '../../utils/tags';

export default class NewTag implements Command {
  names: Array<string> = ['newtag', 'addtag', 'createtag'];
  arguments = '(título) (contenido)';
  group: CommandGroup = 'contributors';
  description = 'Crea un nuevo tag.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const contributorRole: string | null = (await getByName('contributor_role'))?.value || null;
      if (!contributorRole) {
        return;
      }

      const role = message.guild.roles.cache.get(contributorRole);
      if (!role) {
        return;
      }

      await message.delete();

      if (message.member.roles.highest.position < role.position) {
        await deleteMessage(await sendMessage(message, 'no tienes permiso para usar este comando.', alias));
        return;
      }

      const title: string = params[0];
      const content: string = params.slice(1).join(' ');

      if (!title || !content) {
        await deleteMessage(await sendMessage(message, 'argumentos inválidos.', alias));
        return;
      }

      if (message.mentions.roles.size || message.mentions.users.size || message.mentions.members?.size) {
        await deleteMessage(await sendMessage(message, 'no puedes mencionar roles o usuarios.', alias));
        return;
      }

      if (await Tags.hasByTitle(title)) {
        await deleteMessage(await sendMessage(message, 'el tag ya existe, por favor elimínalo o usa otro título.', alias));
        return;
      }

      await Tags.create(title, content);
      await deleteMessage(await sendMessage(message, 'tag creado.', alias));
    } catch (error) {
      console.error('New Tag Command', error);
    }
  }
}
