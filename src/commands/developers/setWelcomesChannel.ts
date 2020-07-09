import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetWelcomesChannel implements Command {
  names: Array<string> = ['setwelcomeschannel'];
  arguments: string = '(canal)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un canal para los mensajes de bienvenida.';

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

      const channelID: string = (params[1] || '').replace('<#', '').replace('>', '');
      if (!channelID || !channelID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un canal.', params[0]));
        return;
      }

      const channel = message.guild.channels.cache.get(channelID);
      if (!channel) {
        await deleteMessage(await sendMessage(message, 'el canal no es válido.', params[0]));
        return;
      }

      if (await Settings.hasByName('welcomes_channel')) {
        await Settings.update('welcomes_channel', channel.id);
      } else {
        await Settings.create('welcomes_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de bienvenidas.`, params[0]));
    } catch (error) {
      console.error('Set Welcomes Channel', error);
    }
  }
}
