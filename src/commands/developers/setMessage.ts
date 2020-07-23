// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';
import getArguments from '../../utils/arguments';

const messageTypes = [
  'dm', 'private',
  'welcomes', 'public',
];

export default class SetMessage implements Command {
  names: Array<string> = ['setmessage', 'configmessage'];
  arguments = `--type=(${messageTypes.join('/')}) --message=(mensaje)`;
  group: CommandGroup = 'developer';
  description = 'Agrega un mensaje a la configuración.';

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
      if (!type.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar el tipo del mensaje.', alias));
        return;
      }

      if (!messageTypes.includes(type)) {
        await deleteMessage(await sendMessage(message, 'el tipo del mensaje no es válido.', alias));
        return;
      }

      const msg: string = commandArguments['--message'] || commandArguments['-m'] || '';
      if (!msg.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un mensaje.', alias));
        return;
      }

      if (msg.length < 10 || msg.length > 2000) {
        await deleteMessage(await sendMessage(message, 'el mensaje debe tener entre 10 y 2000 caracteres.', alias));
        return;
      }

      if (type === 'dm' || type === 'private') {
        if (await Settings.hasByName('dm_welcomes_message')) {
          await Settings.update('dm_welcomes_message', msg);
        } else {
          await Settings.create('dm_welcomes_message', msg);
        }

        await deleteMessage(await sendMessage(message, 'has configurado correctamente el mensaje de bienvenida privado (DM).', alias));
        return;
      } else if (type === 'welcomes' || type === 'public') {
        if (await Settings.hasByName('welcomes_message')) {
          await Settings.update('welcomes_message', msg);
        } else {
          await Settings.create('welcomes_message', msg);
        }

        await deleteMessage(await sendMessage(message, 'has configurado correctamente el mensaje de bienvenida público.', alias));
        return;
      }
    } catch (error) {
      console.error('Set Message Command', error);
    }
  }
}
