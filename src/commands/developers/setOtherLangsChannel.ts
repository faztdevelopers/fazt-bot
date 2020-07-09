import Command, { deleteMessage, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetOtherLangsChannel implements Command {
  format = /^((?<command>(setotherlangschannel))\s<#(?<channel>\d+)>)$/

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
      if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
        return;
      }

      await message.delete();

      const channel = message.guild.channels.cache.get(params.channel);
      if (!channel) {
        await deleteMessage(await sendMessage(message, 'el canal no es válido.', params.command));
        return;
      }

      if (await Settings.hasByName('others_langs_channel')) {
        await Settings.update('others_langs_channel', channel.id);
      } else {
        await Settings.create('others_langs_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de idiomas extranjeros.`, params.command));
    } catch (error) {
      console.error('Set Others Langs Channel', error);
    }
  }
}
