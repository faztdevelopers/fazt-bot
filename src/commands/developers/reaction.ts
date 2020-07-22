// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';
import getArguments from '../../utils/arguments';
import removeReactionRole from '../../utils/reactions/removeReactionRole';
import addReactionRole from '../../utils/reactions/addReactionRole';

export default class Reaction implements Command {
  names: Array<string> = ['reaction', 'react'];
  arguments = '--type=(add/remove) --emoji=(emoji) --role=(rol) --description=(descripción)';
  group: CommandGroup = 'developer';
  description = 'Agrega o elimina una reacción a los roles por reacción.';

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
        await deleteMessage(await sendMessage(message, 'debes ingresar el tipo (add/remove).', alias));
        return;
      }

      const emoji: string = (commandArguments['--emoji'] || commandArguments['-e'] || '').trim();
      const roleID: string = (commandArguments['--role'] || commandArguments['--rol'] || commandArguments['-r'] || '').replace('<@&', '').replace('>', '').trim();

      if (type === 'add') {
        const description: string = commandArguments['--description'] || commandArguments['--desc'] || commandArguments['-d'] || '';
        const warning: string = commandArguments['--warning'] || commandArguments['-warn'] || commandArguments['-w'] || '';

        await addReactionRole(message, alias, emoji, roleID, description, warning, bot);
        return;
      } else if (type === 'remove') {
        await removeReactionRole(message, alias, emoji, roleID, bot);
        return;
      }

      await deleteMessage(await sendMessage(message, 'el tipo no es válido.', alias));
    } catch (error) {
      console.error('Reaction Command', error);
    }
  }
}
