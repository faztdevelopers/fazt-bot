// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed, Guild } from 'discord.js';

export default class extends MessageEmbed {
  constructor(type: 'private' | 'public', userAvatar: string, message: string, guild: Guild) {
    super();

    this.description = message;
    this.timestamp = Date.now();

    if (type === 'public') {
      const colors: number[] = [
        0xF44336,
        0xE91E63,
        0x9C27B0,
        0x3F51B5,
        0x2196F3,
        0x03A9F4,
        0x00BCD4,
        0x009688,
        0x4CAF50,
        0x8BC34A,
        0xCDDC39,
        0xFFEB3B,
        0xFFC107,
        0xFF9800,
        0x795548,
        0x9E9E9E
      ];

      const rand: number = Math.floor(Math.random() * (colors.length - 1));

      this.title = `Bienvenid@ a ${guild.name}`;
      this.color = colors[rand];
      this.setThumbnail(userAvatar);
    } else {
      this.color = 0xFF0022;
      this.setAuthor(`Bienvenid@ a ${guild.name}`, guild.iconURL() || '');
    }
  }
}
