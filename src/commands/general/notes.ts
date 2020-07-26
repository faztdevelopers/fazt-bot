// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client, User } from 'discord.js';
import noteHelpEmbed from '../../embeds/notesEmbeds/noteHelpEmbed';
import notePageEmbed from '../../embeds/notesEmbeds/notePageEmbed';
import * as Notes from '../../utils/notes';

export default class Note implements Command {
  names: Array<string> = ['n', 'notes', 'nota'];
  arguments = '(nota)';
  group: CommandGroup = 'general';
  description = 'Agrega, mira, y elimina tus notas.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      await message.delete();
      const note = params.join(' ').replace(params[0], '').trim();
      let status: string;

      const user: User = message.author;
      const getNotes = await Notes.getNotes(Number(user.id));
      
      let notesPage = getNotes;

      let option: string | undefined = params[0];
      
      if (!option) return;
      option = option.toLowerCase();

      switch (option) {
      case 'add': {
        status = 'Nota agregada';
        if(!note){
          await deleteMessage(await sendMessage(message, 'La nota esta vacia!', alias)); 
          return;
        }

        if(note.length > 1024){
          await deleteMessage(await sendMessage(message, 'El limite de una nota es de 500 Caracteres', alias)); 
          return;
        }
        await Notes.create(Number(user.id), user.username, note);

        await deleteMessage(await sendMessage(message, status, alias));
        break;
      }
      
      case 'page': {
        if(!getNotes.length) {
          await deleteMessage(await sendMessage(message, 'No tienes notas', alias));
          return;
        }

        const perPage = 5;
        const start = (+note - 1) * perPage;
        const end = start + perPage;

        notesPage = notesPage.slice(start, end);

        if (!notesPage.length) {
          await deleteMessage(await sendMessage(message, 'La página no existe', alias));
          return;
        }

        const pages = Math.ceil(getNotes.length / perPage);

        status = 'Lista de notas';
        await message.channel.send(new notePageEmbed(Number(note), pages, user, status, notesPage, start));
        break;
      }

      case 'delete': {
        if(!getNotes.length) {
          deleteMessage(await sendMessage(message, 'No tienes notas', alias));
          return;
        }

        const deleted = await Notes.remove(notesPage, Number(user.id), Number(note));
        status = deleted ? 'Nota eliminada.' : 'La nota no existe.';
        await deleteMessage(await sendMessage(message, status, alias));
        break;
      }

      default:
        await deleteMessage(await message.channel.send(new noteHelpEmbed()));
        break;
      }

    } catch (error) {
      console.error('Notes error', error);
    }
  }
}