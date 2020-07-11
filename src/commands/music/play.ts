// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import Song from '../../utils/song';

export default class PlayCommand implements Command {
  names: Array<string> = ['play', 'reproducir', 'p'];
  arguments = '(Nombre del vídeo/canción)';
  group: CommandGroup = 'music';
  description = 'Reproduce una canción por su nombre.';

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

      const search: string = params.slice(1).join(' ');

      let queue = YouTube.queues[message.guild.id];
      if (!search || !search.length) {
        if (queue && queue.stopped && queue.songs.length) {
          if (!queue.voiceChannel.members.has(message.member.id)) {
            await sendMessage(message, 'no estás en el canal de voz.', params[0]);
            return;
          }

          queue.stopped = false;
          await YouTube.play(message.guild.id);
          return;
        }

        await sendMessage(message, 'el parámetro de búsqueda está vacío', params[0]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let results: any[] = [];

      if (search.startsWith('http')) {
        results = [await YouTube.yt().getVideo(search)];
      } else {
        results = await YouTube.yt().searchVideos(search, 1);
      }

      const songData = results[0];
      if (!results.length || !songData) {
        await sendMessage(message, `no hay resultados para ${search}`, params[0]);
        return;
      }

      await songData.fetch();
      if (songData.durationSeconds > 600) {
        await sendMessage(message, 'la duración del vídeo debe ser menor a 10 minutos.', params[0]);
        return;
      }

      const song = new Song(
        songData.id,
        songData.title,
        songData.thumbnails.default.url,
        songData.description,
        songData.channel.title,
        songData.durationSeconds,
        message.author.id,
      );

      if (!queue) {
        const connection = await message.member.voice.channel.join();

        queue = {
          textChannel: message.channel,
          voiceChannel: message.member.voice.channel,
          connection,
          playing: false,
          playingDispatcher: null,
          stopped: false,
          songs: [song],
          hasVote: false,
        };

        YouTube.queues[message.guild.id] = queue;
      } else {
        if (!queue.voiceChannel.members.has(message.member.id)) {
          await sendMessage(message, 'no estás en el canal de voz.', params[0]);
          return;
        }

        queue.songs.push(song);
      }

      if (queue.stopped) {
        queue.stopped = false;
      }

      if (!queue.playing && !queue.playingDispatcher) {
        await YouTube.play(message.guild.id);
      } else {
        await sendMessage(message, `la canción **${song.getTitle()}** de **${song.getAuthor()}** ha sido agregada a la lista de reproducción.`, params[0]);
      }
    } catch (error) {
      if (error.errors && error.errors[0].reason === 'quotaExceeded') {
        const yt = YouTube.yt(true, true);
        if (yt == null) {
          await sendMessage(message, 'el API excedió el límite de peticiones.', params[0]);
        } else {
          await this.onCommand(message, bot, params);
        }

        return;
      }

      console.error('Play Song Command', error);
    }
  }
}
