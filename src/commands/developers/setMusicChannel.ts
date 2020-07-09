import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as Settings from '../../utils/settings';

export default class SetMusicChannel implements Command {
  format: RegExp = /^((?<command>(setmusicchannel))\s<#(?<channel>\d+)>)$/;
  names: string[] = ['setmusicchannel'];
  arguments: string = '(canal)';
  group: CommandGroup = 'developer';
  description: string = 'Agrega un canal de música.';

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

      if (await Settings.hasByName('music_channel')) {
        await Settings.update('music_channel', channel.id);
      } else {
        await Settings.create('music_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de música.`, params.command));
    } catch (error) {
      console.error('Set Music Channel', error);
    }
  }
}