// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed, User } from 'discord.js';
import { Note } from 'database/models/note';

export default class NoteList extends MessageEmbed {
  constructor(page: number, pages: number, user: User, status: string, notes: Note[]) {
    super();
    this.title = status;
    this.color = 0xFF0022;
    notes.forEach((notes, i) => {
      this.fields.push({
        name: `[ ${i + 1} ] Fecha: ${notes.date}`,
        value: notes.note,
        inline: false
      });
    });
    this.setFooter(`Notas de ${user.username} | Pagina ${page} de ${pages}`, user.displayAvatarURL());
    this.timestamp = Date.now();
  }
}