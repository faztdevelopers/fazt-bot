import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetDJRole implements Command {
  names: Array<string> = ['setdjrole'];
  arguments: string = '(rol)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un rol de DJ del bot.';

  async onCommand(message: Message, bot: Client, params: Array<string>) {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
      if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
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

      if (await Settings.hasByName('dj_role')) {
        await Settings.update('dj_role', role.id);
      } else {
        await Settings.create('dj_role', role.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${role} es el rol de DJ del bot.`, params[0]));
    } catch (error) {
      console.error('Set DJ Role Command', error);
    }
  }
}
