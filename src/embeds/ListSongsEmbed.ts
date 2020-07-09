import {MessageEmbed, Client} from 'discord.js';
import * as YouTube from '../utils/music';

export class InvalidPageNumberError extends Error{}

export default class extends MessageEmbed{

    private ITEMS_PER_PAGE = 10
    private pages: number;

    constructor(bot: Client, queue: YouTube.IQueue, page: number) {
      super();
      this.title = `${bot.user?.username}: Lista de reproducción`;
      this.description = '';
      this.color = 0xF44336;

      this.pages = Math.floor(queue.songs.length / this.ITEMS_PER_PAGE);
      const remaining_songs = queue.songs.length - (this.ITEMS_PER_PAGE * this.pages);
      if(remaining_songs > 0) this.pages++;

      if (isNaN(page) || page <= 0 || page > this.pages) {
        throw new InvalidPageNumberError('Number of page is invalid');
      }

      let i = 0;
      const FIRT_ELEMENT_INDEX = (page - 1) * this.ITEMS_PER_PAGE;
      for (const song of queue.songs.slice(FIRT_ELEMENT_INDEX, page * this.ITEMS_PER_PAGE)) {
        this.description += `${FIRT_ELEMENT_INDEX + i + 1}. **${YouTube.filterTitle(song.title)}** de **${song.channel.title}**\r\n`;
        i++;
      }
    }
}
