// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed, User } from 'discord.js';

export default class SuggestionEmbed extends MessageEmbed {
  constructor(suggestion: string, author: User, url: string[]) {
    super();
    this.title = 'Nueva Votacion';
    this.color = 0xFF0022;
    this.description = `${suggestion}\r\n\r\n**Iniciada por** ${author} (${author.username})`;
    this.timestamp = Date.now();

    if(url[0]){
      this.setImage(url[0]);
    }
  }
}
