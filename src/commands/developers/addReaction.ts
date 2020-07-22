// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client, GuildEmoji, Role } from 'discord.js';
import * as Settings from '../../utils/settings';
import emojiRegex from 'emoji-regex';
import UpdateRolesMessage from './updateRolesMessage';
import { prefix } from '../../';

export interface EmojiPart {
  name: string;
  id: string;
}

export default class AddReaction implements Command {
  names: Array<string> = ['addreaction', 'addreact', 'addrole'];
  arguments = '(emoji) (rol) (descripción)';
  group: CommandGroup = 'developer';
  description = 'Agrega un rol a los roles por reacción.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
      if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
        return;
      }

      await message.delete();

      if (!params.length) {
        await deleteMessage(await sendMessage(message, 'argumentos inválidos.', alias));
        return;
      }

      const emojiPart: EmojiPart = AddReaction.getEmojiPart(params[0]);
      const isNative: boolean = (params[0].match(emojiRegex()) || []).length >= 1;
      if (!emojiPart.name.length && !isNative) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un emoji válido.', alias));
        return;
      }

      let emoji: GuildEmoji | null = null;
      if (!isNative) {
        emoji = bot.emojis.cache.get(emojiPart.id) || null;
        if (!emoji) {
          await deleteMessage(await sendMessage(message, 'el emoji no existe.', alias));
          return;
        }
      }

      const roleID: string = (params[1] || '').replace('<@&', '').replace('>', '');
      if (!roleID || !roleID.length) {
        await deleteMessage(await sendMessage(message, 'debes ingresar un rol válido.', alias));
        return;
      }

      const role: Role | null = message.guild.roles.cache.get(roleID) || null;
      if (!role) {
        await deleteMessage(await sendMessage(message, 'el rol no existe.', alias));
        return;
      }

      if (role.permissions.has('ADMINISTRATOR')) {
        await deleteMessage(await sendMessage(message, 'no puedes agregar este rol.', alias));
        return;
      }

      const description: string = params.slice(2).join(' ');
      if (!description.length) {
        await deleteMessage(await sendMessage(message, 'la descripción no es válida.', alias));
        return;
      }

      const data = `${isNative ? params[0] : emojiPart.id}|||${role.id}|||${description}`;

      const currentReactions = await Settings.getByName('reactions_manual');
      if (currentReactions) {
        const reactions = await UpdateRolesMessage.getReactions(bot, message.guild);
        if (reactions.length) {
          let hasEmoji = false;
          let hasRole = false;

          for await (const reaction of reactions) {
            if (typeof reaction.emoji === 'string' && isNative && reaction.emoji === params[0]) {
              hasEmoji = true;
            } else if (reaction.emoji instanceof GuildEmoji && !isNative && reaction.emoji.id === emojiPart.id) {
              hasEmoji = true;
            } else if (reaction.role.id === role.id) {
              hasRole = true;
            }
          }

          if (hasEmoji) {
            await deleteMessage(await sendMessage(message, 'el emoji ya está en uso.', alias));
            return;
          } else if (hasRole) {
            await deleteMessage(await sendMessage(message, 'el rol ya está en uso.', alias));
            return;
          }
        }

        await Settings.update('reactions_manual', `${currentReactions.value};;${data}`);
      } else {
        await Settings.create('reactions_manual', data);
      }

      await deleteMessage(await sendMessage(message, `reacción añadida, ahora di **${prefix}updaterolesmessage** para crear o actualizar el mensaje.`, alias));
    } catch (error) {
      console.error('Add Reaction Command', error);
    }
  }

  static getEmojiPart(emoji: string): EmojiPart {
    let firstI = -1;
    let secondI = -1;
    let thirdI = -1;
    let animated = false;

    if (emoji.indexOf('<a:') >= 0) {
      firstI = emoji.indexOf('<a:') + 3;
      secondI = emoji.indexOf(':', firstI);
      thirdI = emoji.indexOf('>', secondI);
      animated = true;
    } else if (emoji.indexOf('<:') >= 0) {
      firstI = emoji.indexOf('<:') + 2;
      secondI = emoji.indexOf(':', firstI);
      thirdI = emoji.indexOf('>', secondI);
    }

    return {
      name: emoji.slice(firstI, secondI).trim(),
      id: emoji.slice(secondI + 1, thirdI).trim(),
    };
  }
}
