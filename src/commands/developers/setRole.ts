// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';
import getArguments from '../../utils/arguments';

const roles: Array<string> = [
  'dj',
  'contributors', 'contributor', 'contribuidores', 'contribuidor',
  'moderators', 'moderator', 'moderadores', 'moderador',
  'warning',
];

export default class SetRole implements Command {
  names: Array<string> = ['setrole', 'configrole'];
  arguments = `--type=(${roles.join('/')}) --role=(rol)`;
  group: CommandGroup = 'developer';
  description = 'Agrega un rol a la configuración.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      if (!message.member.hasPermission('ADMINISTRATOR')) {
        const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
        if (!devRole || !message.member.roles.cache.has(devRole)) {
          return;
        }
      }

      if (message.deletable) {
        await message.delete();
      }

      const commandArguments = getArguments(params.join(' ') || '');

      const type: string = commandArguments['--type'] || commandArguments['-t'] || '';
      if (!type || !type.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar el tipo del rol.', alias));
        return;
      }

      if (!roles.includes(type)) {
        await deleteMessage(await sendMessage(message, 'el tipo del rol no es válido.', alias));
        return;
      }

      const roleID: string = (commandArguments['--role'] || commandArguments['--rol'] || commandArguments['-r'] || '').replace('<@&', '').replace('>', '').trim();
      if (!roleID || !roleID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar el rol.', alias));
        return;
      }

      const role = message.guild.roles.cache.get(roleID);
      if (!role) {
        await deleteMessage(await sendMessage(message, 'el rol no existe.', alias));
        return;
      }

      if (type === 'contributors' || type === 'contributor' || type === 'contribuidores' || type === 'contribuidor') {
        if (await Settings.hasByName('contributor_role')) {
          await Settings.update('contributor_role', role.id);
        } else {
          await Settings.create('contributor_role', role.id);
        }

        await deleteMessage(await sendMessage(message, `ahora ${role.toString()} es el rol de contribuidor del servidor.`, alias));
        return;
      } else if (type === 'moderators' || type === 'moderator' || type === 'moderadores' || type === 'moderador') {
        if (await Settings.hasByName('moderator_role')) {
          await Settings.update('moderator_role', role.id);
        } else {
          await Settings.create('moderator_role', role.id);
        }

        await deleteMessage(await sendMessage(message, `ahora ${role.toString()} es el rol de moderador del servidor.`, alias));
        return;
      } else if (type === 'warning') {
        if (await Settings.hasByName('warning_role')) {
          await Settings.update('warning_role', role.id);
        } else {
          await Settings.create('warning_role', role.id);
        }

        await deleteMessage(await sendMessage(message, `ahora ${role.toString()} es el rol de advertencias del servidor.`, alias));
        return;
      }
    } catch (error) {
      console.error('Set Role Command', error);
    }
  }
}
