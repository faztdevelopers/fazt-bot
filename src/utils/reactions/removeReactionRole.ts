// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message, GuildEmoji, Client, Role } from 'discord.js';
import { deleteMessage, sendMessage } from '../../commands/command';
import getEmojiPart, { EmojiPart } from './emojiPart';
import emojiRegex from 'emoji-regex';
import * as Settings from '../settings';
import { ReactionPart, getReactions } from '.';
import updateRolesMessage from './updateRolesMessage';

export default async function removeReactionRole(
  message: Message,
  alias: string,
  emoji: string,
  roleID: string,
  bot: Client,
): Promise<boolean> {
  if (!message.guild) {
    return false;
  }

  const reactions: Array<ReactionPart> = await getReactions(bot, message.guild);
  if (!reactions.length) {
    await deleteMessage(await sendMessage(message, 'no hay roles por reacción para eliminar.', alias));
    return false;
  }

  if (!emoji.length && !roleID.length) {
    await deleteMessage(await sendMessage(message, 'debes ingresar un emoji o un rol para eliminar.', alias));
    return false;
  }

  let reactionToDelete: ReactionPart | null = null;
  if (emoji.length) {
    const emojiPart: EmojiPart = getEmojiPart(emoji);
    const isNative: boolean = (emoji.match(emojiRegex()) || []).length >= 1;
    if (!emojiPart.name.length && !isNative) {
      await deleteMessage(await sendMessage(message, 'debes ingresar un emoji válido.', alias));
      return false;
    }

    let guildEmoji: GuildEmoji | null = null;
    if (!isNative) {
      guildEmoji = bot.emojis.cache.get(emojiPart.id) || null;
      if (!emoji) {
        await deleteMessage(await sendMessage(message, 'el emoji no existe.', alias));
        return false;
      }
    }

    reactionToDelete = reactions.find((reaction) => (
      (typeof reaction.emoji === 'string' && isNative && reaction.emoji === emoji) ||
      (reaction.emoji instanceof GuildEmoji && !isNative && reaction.emoji.id === guildEmoji?.id)
    )) || null;
  } else if (roleID.length) {
    const role: Role | null = message.guild?.roles.cache.get(roleID) || null;
    if (!role) {
      await deleteMessage(await sendMessage(message, 'el rol no existe.', alias));
      return false;
    }

    reactionToDelete = reactions.find((reaction) => reaction.role.id === role.id) || null;
  }

  if (!reactionToDelete) {
    await deleteMessage(await sendMessage(message, 'el emoji o el rol no existe en los roles por reacción.', alias));
    return false;
  }

  if (reactions.length === 1) {
    await Settings.remove('reactions_manual');
  } else {
    reactions.splice(reactions.findIndex((x) => x === reactionToDelete), 1);

    await Settings.update('reactions_manual', reactions.map((reaction) => (
      `${reaction.emoji instanceof GuildEmoji ? reaction.emoji.id : reaction.emoji}|||${reaction.role.id}|||${reaction.description}`
    )).join(';;'));
  }

  if (await updateRolesMessage(bot, message.guild)) {
    await deleteMessage(await sendMessage(message, 'reacción eliminada.', alias));
  } else {
    throw new Error('The role reaction was not removed.');
  }

  return true;
}
