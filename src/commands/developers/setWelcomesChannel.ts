import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetWelcomesChannel implements Command {
  format: RegExp = /^((?<command>(setwelcomeschannel))\s<#(?<channel>\d+)>)$/;
  names: string[] = ['setwelcomeschannel'];
  arguments: string = '(canal)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un canal para los mensajes de bienvenida.';

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

      if (await Settings.hasByName('welcomes_channel')) {
        await Settings.update('welcomes_channel', channel.id);
      } else {
        await Settings.create('welcomes_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de bienvenidas.`, params.command));
    } catch (error) {
      console.error('Set Welcomes Channel', error);
    }
  }
}
