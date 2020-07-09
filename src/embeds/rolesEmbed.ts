// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';
import { prefix } from '..';

export default class extends MessageEmbed {
  constructor(botname: string) {
    super();
    this.color = 0xFF0022;
    this.title = `${botname}: Lista de roles`;
    this.description = `Puedes escoger varios roles. Uso: **${prefix}role (opción)** o **${prefix}role (nombre)**`;
    this.fields = [
      {
        name: 'a) FullStack',
        value: 'Desarrolladores FullStack.',
        inline: false,
      },
      {
        name: 'b) Backend',
        value: 'Desarrolladores Backend.',
        inline: false,
      },
      {
        name: 'c) Mobile',
        value: 'Android, iOS u otros desarrolladores móbiles.',
        inline: false,
      },
      {
        name: 'd) Games',
        value: 'Programadores y desarrolladores de juegos.',
        inline: false,
      },
      {
        name: 'e) Frontend',
        value: 'Desarrolladores Frontend.',
        inline: false,
      },
      {
        name: 'f) Taller',
        value: 'Recibe notificaciones de nuevos talleres.',
        inline: false,
      },
    ];
  }
}
