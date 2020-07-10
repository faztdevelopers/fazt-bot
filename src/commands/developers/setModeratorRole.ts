// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetModeratorRole implements Command {
  names: Array<string> = ['setdevrole', 'setmoderatorrole'];
  arguments = '(rol)';
  group: CommandGroup = 'moderation';
  description = 'Agrega un rol de desarrollador del bot.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member || !message.member.permissions.has('ADMINISTRATOR')) {
        return;
      }

      await message.delete();

      const roleID: string = (params[1] || '').replace('<@&', '').replace('>', '');
      if (!roleID || !roleID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un rol.', params[0]));
        return;
      }

      const role = message.guild.roles.cache.get(roleID);
      if (!role) {
        await deleteMessage(await sendMessage(message, 'el rol no existe.', params[0]));
        return;
      }

      if (await Settings.hasByName('moderator_role')) {
        await Settings.update('moderator_role', role.id);
      } else {
        await Settings.create('moderator_role', role.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${role} es el rol de moderador del bot.`, params[0]));
    } catch (error) {
      console.error('Set Moderator Role Command', error);
    }
  }
}
