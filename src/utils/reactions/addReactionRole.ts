// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message, Client, Role, GuildEmoji } from 'discord.js';
import { deleteMessage, sendMessage } from '../../commands/command';
import getEmojiPart, { EmojiPart } from './emojiPart';
import emojiRegex from 'emoji-regex';
import * as Settings from '../settings';
import { ReactionPart, getReactions } from '.';
import updateRolesMessage from './updateRolesMessage';

export default async function addReactionRole(
  message: Message,
  alias: string,
  emoji: string,
  roleID: string,
  description: string,
  warning: string,
  bot: Client,
): Promise<boolean> {
  if (!message.guild) {
    return false;
  }

  const emojiPart: EmojiPart = getEmojiPart(emoji);
  const isNative: boolean = (emoji.match(emojiRegex()) || []).length >= 1;
  if (!emojiPart.name.length && !isNative) {
    await deleteMessage(await sendMessage(message, 'debes ingresar un emoji válido.', alias));
    return false;
  }

  if (!isNative && !bot.emojis.cache.get(emojiPart.id)) {
    await deleteMessage(await sendMessage(message, 'el emoji no existe.', alias));
    return false;
  }

  if (!roleID.length) {
    await deleteMessage(await sendMessage(message, 'debes ingresar un rol válido.', alias));
    return false;
  }

  const role: Role | null = message.guild?.roles.cache.get(roleID) || null;
  if (!role) {
    await deleteMessage(await sendMessage(message, 'el rol no existe.', alias));
    return false;
  }

  if (role.permissions.has('ADMINISTRATOR')) {
    await deleteMessage(await sendMessage(message, 'no puedes agregar este rol.', alias));
    return false;
  }

  if (!description.length) {
    await deleteMessage(await sendMessage(message, 'la descripción no es válida.', alias));
    return false;
  }

  if (description.length < 5 || description.length > 100) {
    await deleteMessage(await sendMessage(message, 'la descripción debe tener entre 5 y 100 caracteres.', alias));
    return false;
  }

  if (warning === 'true') {
    const warningRoleID = await Settings.getByName('warning_role');
    if (!warningRoleID) {
      await deleteMessage(await sendMessage(message, 'el rol de warning no está configurado.', alias));
      return false;
    }
  }

  const reactions: Array<ReactionPart> = await getReactions(bot, message.guild);
  if (reactions.length) {
    let hasEmoji = false;
    let hasRole = false;

    for await (const reaction of reactions) {
      if (typeof reaction.emoji === 'string' && isNative && reaction.emoji === emoji) {
        hasEmoji = true;
      } else if (reaction.emoji instanceof GuildEmoji && !isNative && reaction.emoji.id === emojiPart.id) {
        hasEmoji = true;
      } else if (reaction.role.id === role.id) {
        hasRole = true;
      }
    }

    if (hasEmoji) {
      await deleteMessage(await sendMessage(message, 'el emoji ya está en uso.', alias));
      return false;
    } else if (hasRole) {
      await deleteMessage(await sendMessage(message, 'el rol ya está en uso.', alias));
      return false;
    }

    reactions.push({
      emoji: isNative ? emoji : emojiPart.id,
      isNative,
      role,
      description,
      removeWarning: warning === 'true',
    });

    await Settings.update('reactions_manual', reactions.map((reaction) => (
      `${reaction.emoji instanceof GuildEmoji ? reaction.emoji.id : reaction.emoji}|||${reaction.role.id}|||${reaction.description}${reaction.removeWarning ? '|||true' : ''}`
    )).join(';;'));
  } else {
    await Settings.create('reactions_manual', `${isNative ? emoji : emojiPart.id}|||${role.id}|||${description}${warning === 'true' ? '|||true' : ''}`);
  }

  if (await updateRolesMessage(bot, message.guild)) {
    await deleteMessage(await sendMessage(message, 'reacción añadida.', alias));
  } else {
    throw new Error('The role reaction was not added.');
  }

  return true;
}
