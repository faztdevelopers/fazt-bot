import Command, { deleteMessage, sendMessage } from '../command';
import { Message, MessageEmbed, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import { bot } from '../..';

export default class ListCommand implements Command {

  format = /^((?<command>(list|queue|lista))+(\s(?<page>\d+))?)$/

  async onCommand(message: Message, bot: Client, params: {[key: string]: string}) {
    try {
      if (!message.guild) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params.command));
        return;
      }

      let queue = YouTube.queues[message.guild.id];
      if (!queue) {
        await sendMessage(message, 'no estoy reproduciendo música.', params.command);
        return;
      }

      if (!queue.songs.length) {
        await sendMessage(message, 'no hay canciones en la lista de reproducción.', params.command);
        return;
      }

      const itemsPerPage: number = 10;
      let pages: number = Math.floor(queue.songs.length / itemsPerPage);

      if (queue.songs.length - (itemsPerPage * pages) > 0) {
        pages++;
      }

      const page: number = Number(params.page || '1');
      if (isNaN(page) || page <= 0 || page > pages) {
        await sendMessage(message, 'la página no es válida', params.command);
        return;
      }

      const songs: string[] = [];

      let i: number = 0;
      for await (let song of queue.songs.slice((page - 1) * itemsPerPage, page * itemsPerPage)) {
        songs.push(`${(page - 1) * itemsPerPage + i + 1}. **${YouTube.filterTitle(song.title)}** de **${song.channel.title}**`);
        i++;
      }

      await message.channel.send(
        new MessageEmbed()
          .setTitle(`${bot.user?.username}: Lista de reproducción`)
          .setColor('#f44336')
          .setDescription(songs.join('\r\n'))
          .setFooter(`Página ${page} de ${pages}`)
          .setTimestamp(Date.now()),
      );
    } catch (error) {
      console.error('Queue Command', error);
    }
  }
}
