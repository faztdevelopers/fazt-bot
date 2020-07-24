// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup, deleteMessage, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import * as Tags from '../../utils/tags';

export default class DeleteTag implements Command {
  names: Array<string> = ['deletetag', 'removetag', 'deltag'];
  arguments = '(título)';
  group: CommandGroup = 'contributors';
  description = 'Elimina un tag por su título.';

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
      if (!title) {
        await deleteMessage(await sendMessage(message, 'debes especificar un título.', alias));
        return;
      }

      if (await Tags.hasByTitle(title)) {
        await Tags.deleteByTitle(title);
        await deleteMessage(await sendMessage(message, 'tag eliminado.', alias));
        return;
      }

      await deleteMessage(await sendMessage(message, 'el tag no fue encontrado.', alias));
    } catch (error) {
      console.error('Delete Tag Command', error);
    }
  }
}
