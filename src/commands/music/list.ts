import Command, { deleteMessage, sendMessage } from '../command';
import { Message, MessageEmbed, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import ListSongEmbed, {InvalidPageNumberError} from "../../embeds/ListSongsEmbed"

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
      
      const page: number = Number(params.page || 1);
      
      await message.channel.send(new ListSongEmbed(bot, queue, page));

    } catch (error) {
      if(error instanceof InvalidPageNumberError) {
        await sendMessage(message, 'la página no es válida', params.command);
      } else {
        console.error('Queue Command', error);
      }
    }
  }
}
