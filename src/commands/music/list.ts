import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';
import ListSongEmbed, { InvalidPageNumberError } from '../../embeds/ListSongsEmbed';

export default class ListCommand implements Command {
  names: Array<string> = ['list', 'queue', 'lista'];
  arguments: string = '(página)';
  group: CommandGroup = 'music';
  description: string = 'Mira la lista de reproducción actual.';

  async onCommand(message: Message, bot: Client, params: Array<string>) {
    try {
      if (!message.guild) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params[0]));
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue) {
        await sendMessage(message, 'no estoy reproduciendo música.', params[0]);
        return;
      }

      if (!queue.songs.length) {
        await sendMessage(message, 'no hay canciones en la lista de reproducción.', params[0]);
        return;
      }

      const page = Number(params[1] || 1);

      await message.channel.send(new ListSongEmbed(bot, queue, page));
    } catch (error) {
      if (error instanceof InvalidPageNumberError) {
        await sendMessage(message, 'la página no es válida', params[0]);
      } else {
        console.error('Queue Command', error);
      }
    }
  }
}
