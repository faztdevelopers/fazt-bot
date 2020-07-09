import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetDeveloperRole implements Command {
  names: Array<string> = ['setdevrole', 'setdeveloperrole'];
  arguments: string = '(rol)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un rol de desarrollador del bot.';

  async onCommand(message: Message, bot: Client, params: Array<string>) {
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

      if (await Settings.hasByName('developer_role')) {
        await Settings.update('developer_role', role.id);
      } else {
        await Settings.create('developer_role', role.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${role} es el rol de desarrollador del bot.`, params[0]));
    } catch (error) {
      console.error('Set Developer Role Command', error);
    }
  }
}
