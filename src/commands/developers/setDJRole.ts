import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetDJRole implements Command {
  format: RegExp = /^((?<command>(setdjrole))\s<@&(?<role>\d+)>)$/;
  names: string[] = ['setdjrole'];
  arguments: string = '(rol)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un rol de DJ del bot.';

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

      const role = message.guild.roles.cache.get(params.role);
      if (!role) {
        await sendMessage(message, 'el rol no existe.', params.command);
        return;
      }

      if (await Settings.hasByName('dj_role')) {
        await Settings.update('dj_role', params.role);
      } else {
        await Settings.create('dj_role', params.role);
      }

      await deleteMessage(await sendMessage(message, `ahora ${role} es el rol de DJ del bot.`, params.command));
    } catch (error) {
      console.error('Set DJ Role Command', error);
    }
  }
}
