// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';

export default class OnOthersLangsEmbed extends MessageEmbed {
  constructor(message: string, username: string) {
    super();

    this.color = 0xFF0022;
    this.description = message;
    this.setFooter(username);
    this.timestamp = Date.now();
  }
}
