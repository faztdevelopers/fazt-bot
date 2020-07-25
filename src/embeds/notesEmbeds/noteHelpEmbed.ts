// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed} from 'discord.js';

export default class noteHelp extends MessageEmbed {
  constructor() {
    super();
    this.title = 'Acciones';
    this.color = 0xFF0022;
    this.fields = [
      {
        name: 'page (``Number``), numero de la página que quieres ver.',
        value: 'Mira las notas de una página.',
        inline: false,
      },
      {
        name: 'add (Nota)',
        value: 'Agrega una nota.',
        inline: false,
      },
      {
        name: 'delete (``ID``)',
        value: 'Elimina una nota.',
        inline: false,
      }
    ];
    this.timestamp = Date.now();

  }
}