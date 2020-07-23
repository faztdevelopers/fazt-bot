// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';

export default class extends MessageEmbed {
  constructor(serverName: string, userAvatar: string, message: string) {
    super();

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

    this.color = colors[rand];
    this.title = `Bienvenid@ a ${serverName}`;
    this.setThumbnail(userAvatar);
    this.description = message;
    this.timestamp = Date.now();
  }
}
