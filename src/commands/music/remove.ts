// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import { prefix } from '../..';

export default class RemoveCommand implements Command {
  names: Array<string> = ['remove', 'delete', 'eliminar'];
  arguments = '(Número)';
  group: CommandGroup = 'music';
  description = 'Elimina una canción de la lista de reproducción. (Si hay más de 2 oyentes se hará votación)';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params[0]));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'no estás en un canal de voz.', params[0]);
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', params[0]);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', params[0]);
        return;
      }

      const i = Number(params[1]);
      if (isNaN(i) || i <= 0) {
        await sendMessage(message, 'el número no es válido.', params[0]);
        return;
      }

      if ((i - 1) === 0 && queue.playing && queue.playingDispatcher) {
        await sendMessage(message, `usa **'${prefix}siguiente'** para cambiar la canción actual.`, params[0]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const songData: any = queue.songs[i - 1];
      if (!songData) {
        await sendMessage(message, `la canción **#${i}** no existe en la lista de reproducción`, params[0]);
        return;
      }

      await YouTube.voteSystem(message, ['remove', params[0]], (params[2] || '').toLowerCase() === 'forced', {
        song_index: (i - 1).toString(),
        song_name: YouTube.filterTitle(songData.title),
        song_author: songData.channel.title,
      });
    } catch (error) {
      console.error('Remove Command', error);
    }
  }

}
