import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, MessageEmbed, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import { prefix } from '../..';

export default class SearchCommand implements Command {
  names: Array<string> = ['search', 'buscar', 's'];
  arguments = '(Nombre del vídeo/canción)';
  group: CommandGroup = 'music';
  description = 'Obtén los 10 primeros resultados de una búsqueda.';

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

      if (!params[1] || !params[1].length) {
        await sendMessage(message, 'el parámetro de búsqueda está vacío.', params[0]);
        return;
      }

      const results = await YouTube.yt().searchVideos(params[1], 10);
      if (!results.length) {
        await sendMessage(message, `no hay resultados para ${params[1]}`, params[0]);
        return;
      }

      const collector = message.channel.createMessageCollector((message: Message) => (
        message.content.toLowerCase().startsWith(prefix) && !message.author.bot
      ));

      collector.on('collect', async (msg: Message) => {
        if (!msg.guild || !msg.member || !msg.member.voice.channel) {
          return;
        }

        if (!msg.content.toLowerCase().startsWith(`${prefix}searchplay`)) {
          collector.stop();
          return;
        }

        const song: string = msg.content.toLowerCase().split(' ')[1];
        if (!song) {
          return;
        }

        const i = Number(song);
        if (isNaN(i) || i <= 0 || i > 10) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const songData: any = results[i - 1];

        let queue = YouTube.queues[msg.guild.id];
        if (!queue) {
          const connection = await msg.member.voice.channel.join();

          queue = {
            textChannel: msg.channel,
            voiceChannel: msg.member.voice.channel,
            connection,
            playing: false,
            playingDispatcher: null,
            stopped: false,
            songs: [songData],
            hasVote: false,
          };

          YouTube.queues[msg.guild.id] = queue;
        } else {
          if (!queue.voiceChannel.members.has(msg.member.id)) {
            await sendMessage(msg, 'no estás en el canal de voz.', params[0]);
            return;
          }

          queue.songs.push(songData);
        }

        if (!queue.playing && !queue.playingDispatcher) {
          await YouTube.play(msg.guild.id);
        } else {
          await sendMessage(message, `la canción **${YouTube.filterTitle(songData.title)}** de **${songData.channel.title}** ha sido agregada a la lista de reproducción.`, params[0]);
        }

        collector.stop();
      });

      const songs: string[] = [];

      let i = 0;
      for await (const result of results) {
        songs.push(`${i + 1}. **${YouTube.filterTitle(result.title)}** de **${result.channel.title}**`);
        i++;
      }

      await message.channel.send(
        new MessageEmbed()
          .setTitle(`Resultados de ${params[1]}`)
          .setColor('#f44336')
          .setDescription(`Usa **'${prefix}searchplay [número]'** para poner una canción de la búsqueda:\r\n${songs.join('\r\n')}`)
          .setTimestamp(Date.now())
      );
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

      console.error('Search Song Command', error);
    }
  }
}
