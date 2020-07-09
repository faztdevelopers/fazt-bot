import Command, { sendMessage, deleteMessage } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetDeveloperRole implements Command {
  format = /^((?<command>(setdevrole|setdeveloperrole))\s<@&(?<role>\d+)>)$/

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    try {
      if (!message.guild || !message.member || !message.member.permissions.has('ADMINISTRATOR')) {
        return;
      }

      await message.delete();

      const role = message.guild.roles.cache.get(params.role);
      if (!role) {
        await sendMessage(message, 'el rol no existe.', params.command);
        return;
      }

      if (await Settings.hasByName('developer_role')) {
        await Settings.update('developer_role', params.role);
      } else {
        await Settings.create('developer_role', params.role);
      }

      await deleteMessage(await sendMessage(message, `ahora ${role} es el rol de desarrollador del bot.`, params.command));
    } catch (error) {
      console.error('Set Developer Role Command', error);
    }
  }
}
