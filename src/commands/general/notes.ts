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
      const option: string = (params[0]).toLowerCase();
      let status: string;

      const user: User = message.author;
      const getNotes = await Notes.getNotes(Number(user.id));
      
      let notesPage = getNotes;
      let pageView = 0;
      let Pages = 0;
      const ids: number[] = [];
      const checkNote = async () => {
        if(pageView === 1){
          notesPage = notesPage.slice(0, 5);
        } else {
          notesPage = notesPage.slice(5, 10);
        }
        notesPage.forEach(async (n, i) => {
          ids.push(i + 1);
        });
        if(ids.includes(Number(note))){
          await Notes.remove(notesPage, Number(user.id), Number(note));
          return;
        } else {
          status = 'El ``id`` de nota no existe.';
        }
      };
  
      switch (option) {
      case 'add': {
        status = 'Nota agregada';
        if(!note){
          await deleteMessage(await sendMessage(message, 'La nota esta vacia!', alias)); 
          return;
        }

        if(getNotes.length > 9) {
          status = 'Has llegado al limite de notas :(';
          await deleteMessage(await sendMessage(message, 'Has llegado al limite de notas', alias));
          return;
        } else {
          if(note.length > 500){
            await deleteMessage(await sendMessage(message, 'El limite de una nota es de 500 Caracteres', alias)); 
            return;
          }
          await Notes.create(Number(user.id), user.username, note);
        }
        await deleteMessage(await sendMessage(message, status, alias));
        break;
      }
      
      case 'page': {
        status = 'Lista de notas';
        if(!getNotes.length) {
          await deleteMessage(await sendMessage(message, 'No tienes notas', alias));
          return;
        }
        if(![1, 2].includes(Number(note))) {
          await deleteMessage(await sendMessage(message, 'La página no existe', alias));
          return;
        }
        if(getNotes.length > 5) Pages = 2; else Pages = 1;
        if(Number(note) === 1){
          notesPage = notesPage.slice(0, 5);
          pageView = 1;
        } else {
          if(getNotes.length > 5){
            pageView = 2;
            notesPage = notesPage.slice(5, 10);
          } else {
            await deleteMessage(await sendMessage(message, 'La página no existe', alias));
            return;
          }
        }
        await message.channel.send(new notePageEmbed(Number(note), Pages, user, status, notesPage));
        break;
      }

      case 'delete': {
        status = 'Nota eliminada.';
        if(!getNotes.length) {
          deleteMessage(await sendMessage(message, 'No tienes notas', alias));
          return;
        }
        await checkNote();
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