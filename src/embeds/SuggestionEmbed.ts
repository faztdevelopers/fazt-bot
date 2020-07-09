import { MessageEmbed, User } from 'discord.js';

export default class SuggestionEmbed extends MessageEmbed {
  constructor(suggestion: string, author: User) {
    super()
    this.title = `Nueva sugerencia`;
    this.color = 0xFF0022;
    this.description = `${suggestion}\r\n\r\n**Sugerido por: ** ${author} (${author.username})`;
    this.timestamp = Date.now();
  }
}
