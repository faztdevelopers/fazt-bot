// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetOtherLangsChannel implements Command {
  names: Array<string> = ['setotherlangschannel'];
  arguments = '(canal)';
  group: CommandGroup = 'developer';
  description = 'Agrega un canal para otros idiomas.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
      if (!devRole) {
        return;
      }

      if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(devRole)) {
        return;
      }

      await message.delete();

      const channelID: string = (params[0] || '').replace('<#', '').replace('>', '');
      if (!channelID || !channelID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un canal.', alias));
        return;
      }

      const channel = message.guild.channels.cache.get(channelID);
      if (!channel) {
        await deleteMessage(await sendMessage(message, 'el canal no es válido.', alias));
        return;
      }

      if (await Settings.hasByName('others_langs_channel')) {
        await Settings.update('others_langs_channel', channel.id);
      } else {
        await Settings.create('others_langs_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de idiomas extranjeros.`, alias));
    } catch (error) {
      console.error('Set Others Langs Channel', error);
    }
  }
}
