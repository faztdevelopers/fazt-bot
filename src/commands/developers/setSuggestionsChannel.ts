import Command, { deleteMessage, sendMessage } from '../command';
import { Message } from 'discord.js';
import * as Settings from '../../utils/settings';

const SetMusicChannel: Command = {
  format: /^((?<command>(setsuggestionschannel))\s<#(?<channel>\d+)>)$/,
  execute: async (message: Message, params: { [key: string]: string }) => {
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

      if (await Settings.hasByName('suggestion_channel')) {
        await Settings.update('suggestion_channel', channel.id);
      } else {
        await Settings.create('suggestion_channel', channel.id);
      }

      await deleteMessage(await sendMessage(message, `ahora ${channel} es el canal de las sugerencias.`, params.command));
    } catch (error) {
      console.error('Set Suggestions Channel', error);
    }
  },
};

export default SetMusicChannel;
