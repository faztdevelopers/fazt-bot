// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';
import getArguments from '../../utils/arguments';

const channels: Array<string> = [
  'music', 'música',
  'suggestions', 'sugerencias',
  'votations', 'votaciones',
  'other_langs', 'no-spanish', 'no-español',
  'welcomes', 'bienvenidas',
  'roles-reaction', 'roles-reacción',
];

export default class SetChannel implements Command {
  names: Array<string> = ['setchannel', 'configchannel'];
  arguments = `--type=(${channels.join('/')}) --channel=(canal)`;
  group: CommandGroup = 'developer';
  description = 'Agrega un canal a la configuración.';

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
        await deleteMessage(await sendMessage(message, 'debes ingresar el tipo del canal.', alias));
        return;
      }

      if (!channels.includes(type)) {
        await deleteMessage(await sendMessage(message, 'el tipo del canal no es válido.', alias));
        return;
      }

      const channelID: string = (commandArguments['--channel'] || commandArguments['-c'] || '').replace('<#', '').replace('>', '').trim();
      if (!channelID || !channelID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un canal.', alias));
        return;
      }

      const channel = message.guild.channels.cache.get(channelID);
      if (!channel) {
        await deleteMessage(await sendMessage(message, 'el canal no existe.', alias));
        return;
      }

      if (type === 'music' || type === 'música') {
        if (await Settings.hasByName('music_channel')) {
          await Settings.update('music_channel', channel.id);
        } else {
          await Settings.create('music_channel', channel.id);
        }

        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de música.`, alias));
        return;
      } else if (type === 'suggestions' || type === 'sugerencias') {
        if (await Settings.hasByName('suggestion_channel')) {
          await Settings.update('suggestion_channel', channel.id);
        } else {
          await Settings.create('suggestion_channel', channel.id);
        }
  
        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de las sugerencias.`, alias));
        return;
      } else if (type === 'votations' || type === 'votaciones') {
        if (await Settings.hasByName('votation_channel')) {
          await Settings.update('votation_channel', channel.id);
        } else {
          await Settings.create('votation_channel', channel.id);
        }
  
        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de las votaciones.`, alias));
        return;
      } else if (type === 'other_langs' || type === 'no-spanish' || type === 'no-español') {
        if (await Settings.hasByName('others_langs_channel')) {
          await Settings.update('others_langs_channel', channel.id);
        } else {
          await Settings.create('others_langs_channel', channel.id);
        }
  
        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de idiomas extranjeros.`, alias));
        return;
      } else if (type === 'welcomes' || type === 'bienvenidas') {
        if (await Settings.hasByName('welcomes_channel')) {
          await Settings.update('welcomes_channel', channel.id);
        } else {
          await Settings.create('welcomes_channel', channel.id);
        }
  
        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de bienvenidas.`, alias));
        return;
      } else if (type === 'roles-reaction' || type === 'roles-reacción') {
        if (await Settings.hasByName('roles_channel')) {
          await Settings.update('roles_channel', channel.id);
        } else {
          await Settings.create('roles_channel', channel.id);
        }
  
        await deleteMessage(await sendMessage(message, `ahora ${channel.toString()} es el canal de los roles por reacción.`, alias));
        return;
      }
    } catch(error) {
      console.error('Set Channel Command', error);
    }
  }
}
