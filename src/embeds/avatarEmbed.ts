// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';

export default class extends MessageEmbed {
  constructor(author: string, avatar: string) {
    super();
    this.color = 0xFF0022;
    this.title = `Hey ${author}, este es tu avatar`;
    this.image = {url: avatar};
  }
}
