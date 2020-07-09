import {MessageEmbed, User} from 'discord.js';

export default class SuggestionEmbed extends MessageEmbed{
  constructor(suggestion: string, author: User) {
    super();
    this.title = 'Nueva sugerencia';
    this.color = 0x009688;
    this.description = `${suggestion}\r\n\r\n**Sugerencia por: ** ${author} (${author.username})`;
    this.timestamp = Date.now();
  }
}