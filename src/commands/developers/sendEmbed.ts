// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client, GuildChannel, TextChannel, MessageEmbed } from 'discord.js';
import * as Settings from '../../utils/settings';
import getArguments from '../../utils/arguments';

export default class SendEmbed implements Command {
  names: Array<string> = ['sendembed', 'embed'];
  arguments = '--edit=(ID mensaje) --channel=(canal) --text=(mensaje) --thumbnail=(url) --image=(url) --title=(título) --footer=(extra) --url=(url) --color=(color)';
  group: CommandGroup = 'developer';
  description = 'Envía o edita un mensaje embebido.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      if (!message.member.hasPermission('ADMINISTRATOR')) {
        const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
        if (!devRole || !message.member.roles.cache.has(devRole)) {
          return;
        }
      }

      if (message.deletable) {
        await message.delete();
      }

      const commandArguments = getArguments(params.join(' ') || '');

      const channelID: string = (commandArguments['--channel'] || commandArguments['-c'] || message.channel.id).replace('<#', '').replace('>', '').trim();
      if (!channelID || !channelID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un canal.', alias));
        return;
      }

      const channel = message.guild.channels.cache.get(channelID);
      if (!channel || !(((o: GuildChannel): o is TextChannel => o.type === 'text')(channel))) {
        await deleteMessage(await sendMessage(message, 'el canal no existe.', alias));
        return;
      }

      let messageToEdit: Message | null = null;

      const editMessageID: string = commandArguments['--edit'] || commandArguments['-e'] || '';
      if (editMessageID.length) {
        messageToEdit = await channel.messages.fetch(editMessageID);
        if (!messageToEdit) {
          await deleteMessage(await sendMessage(message, 'el mensaje no existe.', alias));
          return;
        }

        if (!messageToEdit.editable) {
          await deleteMessage(await sendMessage(message, 'el mensaje no puede ser editado.', alias));
          return;
        }
      }

      const embed: MessageEmbed = new MessageEmbed();
      const embedEdit: MessageEmbed | undefined = messageToEdit?.embeds[0];

      const title: string = commandArguments['--title'] || commandArguments['-T'] || '';
      if (!title.length && !messageToEdit) {
        await deleteMessage(await sendMessage(message, 'debes añadir un título.', alias));
        return;
      }

      if (title.length > 256) {
        await deleteMessage(await sendMessage(message, 'el título puede tener máximo 256 caracteres.', alias));
        return;
      }

      embed.setTitle(title || embedEdit?.title);

      const url: string = commandArguments['--url'] || commandArguments['-u'] || '';
      if (url.length) {
        if (!this.isValidURL(url) && url !== 'remove') {
          await deleteMessage(await sendMessage(message, 'debes ingresar una url válida.', alias));
          return;
        }

        embed.setURL(url === 'remove' ? '' : url);
      } else if (embedEdit?.url?.length) {
        embed.setURL(embedEdit.url);
      }

      const text: string = commandArguments['--text'] || commandArguments['-t'] || '';
      if (!text.length && !messageToEdit) {
        await deleteMessage(await sendMessage(message, 'debes añadir un texto.', alias));
        return;
      }

      if (text.length > 2048) {
        await deleteMessage(await sendMessage(message, 'el texto puede tener máximo 2048 caracteres.', alias));
        return;
      }

      embed.setDescription(text || embedEdit?.description);

      const color: string = commandArguments['--color'] || commandArguments['-C'] || '';
      if (color.length) {
        if (!this.isValidColor(color) && color !== 'remove') {
          await deleteMessage(await sendMessage(message, 'debes ingresar un color válido.', alias));
          return;
        }

        embed.setColor(color === 'remove' ? '' : color);
      } else if (embedEdit?.color) {
        embed.setColor(embedEdit.color);
      }

      const thumbnail: string = commandArguments['--thumbnail'] || '';
      if (thumbnail.length) {
        if (!this.isValidURL(thumbnail) && thumbnail !== 'remove') {
          await deleteMessage(await sendMessage(message, 'debes ingresar un thumbnail válido.', alias));
          return;
        }

        embed.setThumbnail(thumbnail === 'remove' ? '' : thumbnail);
      } else if (embedEdit?.thumbnail?.url.length) {
        embed.setThumbnail(embedEdit.thumbnail.url);
      }

      const image: string = commandArguments['--image'] || commandArguments['--img'] || commandArguments['-i'] || '';
      if (image.length) {
        if (!this.isValidURL(image) && image !== 'remove') {
          await deleteMessage(await sendMessage(message, 'debes ingresar una imagen válida.', alias));
          return;
        }

        embed.setImage(image === 'remove' ? '' : image);
      } else if (embedEdit?.image?.url.length) {
        embed.setImage(embedEdit.image.url);
      }

      const footer: string = commandArguments['--footer'] || commandArguments['-f'] || '';
      if (footer.length) {
        if (footer.length > 2048) {
          await deleteMessage(await sendMessage(message, 'el footer puede tener máximo 2048 caracteres.', alias));
          return;
        }

        embed.setFooter(footer);
      } else if (embedEdit?.footer?.text?.length) {
        embed.setFooter(embedEdit.footer.text);
      }

      embed.setTimestamp(Date.now());

      if (embed.length > 6000) {
        await deleteMessage(await sendMessage(message, 'el embed puede tener máximo 6000 caracteres.', alias));
        return;
      }

      if (messageToEdit) {
        await messageToEdit.edit(embed);
        await deleteMessage(await sendMessage(message, `el mensaje ha sido editado en ${channel.toString()}.`, alias));
      } else {
        await channel.send(embed);
        await deleteMessage(await sendMessage(message, `el mensaje ha sido enviado a ${channel.toString()}.`, alias));
      }
    } catch (error) {
      console.error('Send Embed Command', error);
    }
  }

  private isValidURL(url: string): boolean {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/.test(url);
  }

  private isValidColor(color: string): boolean {
    return /^(#?[0-9A-Fa-f]{6})$/.test(color);
  }
}
