import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import { prefix } from '../..';

export default class RemoveCommand implements Command {
  format: RegExp = /^(((?<command>(remove|delete|eliminar))\s(?<index>\d+))+(\s(?<forced>(forced)))?)$/;
  names: string[] = ['remove', 'delete', 'eliminar'];
  arguments: string = '(Número)';
  group: CommandGroup = 'music';
  description: string = 'Elimina una canción de la lista de reproducción. (Si hay más de 2 oyentes se hará votación)';

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params.command));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'no estás en un canal de voz.', params.command);
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', params.command);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', params.command);
        return;
      }

      const i = Number(params.index);
      if (isNaN(i) || i <= 0) {
        await sendMessage(message, 'el número no es válido.', params.command);
        return;
      }

      if ((i - 1) === 0 && queue.playing && queue.playingDispatcher) {
        await sendMessage(message, `usa **'${prefix}siguiente'** para cambiar la canción actual.`, params.command);
        return;
      }

      const songData: any = queue.songs[i - 1];
      if (!songData) {
        await sendMessage(message, `la canción **#${i}** no existe en la lista de reproducción`, params.command);
        return;
      }

      await YouTube.voteSystem(message, ['remove', params.command], params.forced === 'forced', {
        song_index: (i - 1).toString(),
        song_name: YouTube.filterTitle(songData.title),
        song_author: songData.channel.title,
      });
    } catch (error) {
      console.error('Remove Command', error);
    }
  }

}
