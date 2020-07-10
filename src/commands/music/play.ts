// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';

export default class PlayCommand implements Command {
  names: Array<string> = ['play', 'reproducir', 'p'];
  arguments = '(Nombre del vídeo/canción)';
  group: CommandGroup = 'music';
  description = 'Reproduce una canción por su nombre.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    const command: string = params[0];
    const querySong: string = params.slice(1).join(' ');

    try {
      if (!message.guild || !message.member) return;

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, command));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'no estás en un canal de voz.', command);
        return;
      }

      let queue = YouTube.queues[message.guild.id];
      if (!querySong || !querySong.length) {
        if (queue && queue.stopped && queue.songs.length) {
          if (!queue.voiceChannel.members.has(message.member.id)) {
            await sendMessage(message, 'no estás en el canal de voz.', command);
            return;
          }

          queue.stopped = false;
          await YouTube.play(message.guild.id);
          return;
        }

        await sendMessage(message, 'el parámetro de búsqueda está vacío', command);
        return;
      }

      const results = await YouTube.yt().searchVideos(querySong, 1);
      if (!results.length) {
        await sendMessage(message, `no hay resultados para ${querySong}`, command);
        return;
      }

      if (!queue) {
        const connection = await message.member.voice.channel.join();

        queue = {
          textChannel: message.channel,
          voiceChannel: message.member.voice.channel,
          connection,
          playing: false,
          playingDispatcher: null,
          stopped: false,
          songs: [results[0]],
          hasVote: false,
        };

        YouTube.queues[message.guild.id] = queue;
      } else {
        if (!queue.voiceChannel.members.has(message.member.id)) {
          await sendMessage(message, 'no estás en el canal de voz.', command);
          return;
        }

        queue.songs.push(results[0]);
      }

      if (queue.stopped) {
        queue.stopped = false;
      }

      if (!queue.playing && !queue.playingDispatcher) {
        await YouTube.play(message.guild.id);
      } else {
        await sendMessage(message, `la canción **${YouTube.filterTitle(results[0].title)}** de **${results[0].channel.title}** ha sido agregada a la lista de reproducción.`, command);
      }
    } catch (error) {
      if (error.errors && error.errors[0].reason === 'quotaExceeded') {
        const yt = YouTube.yt(true, true);
        if (yt == null) {
          await sendMessage(message, 'el API excedió el límite de peticiones.', command);
        } else {
          await this.onCommand(message, bot, params);
        }

        return;
      }

      console.error('Play Song Command', error);
    }
  }
}
