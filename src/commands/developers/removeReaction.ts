// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client, GuildEmoji, Role } from 'discord.js';
import * as Settings from '../../utils/settings';
import emojiRegex from 'emoji-regex';
import AddReaction, { EmojiPart } from './addReaction';
import UpdateRolesMessage, { ReactionPart } from './updateRolesMessage';
import { prefix } from '../../';

export default class RemoveReaction implements Command {
  names: Array<string> = ['removereaction', 'delreact', 'delrole', 'removereact', 'removerole', 'removereaction'];
  arguments = '(emoji/rol)';
  group: CommandGroup = 'developer';
  description = 'Elimina un rol de los roles por reacción.';

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
        await deleteMessage(await sendMessage(message, 'debes ingresar un emoji o un rol.', alias));
        return;
      }

      const reactions = await UpdateRolesMessage.getReactions(bot, message.guild);
      if (!reactions.length) {
        await deleteMessage(await sendMessage(message, 'no hay roles por reacción para eliminar.', alias));
        return;
      }

      let reactionToDelete: ReactionPart | null = null;
      if (params[0].startsWith('<@&')) {
        const roleID: string = (params[0] || '').replace('<@&', '').replace('>', '');
        if (!roleID || !roleID.length) {
          await deleteMessage(await sendMessage(message, 'debes ingresar un rol válido.', alias));
          return;
        }

        const role: Role | null = message.guild.roles.cache.get(roleID) || null;
        if (!role) {
          await deleteMessage(await sendMessage(message, 'el rol no existe.', alias));
          return;
        }

        reactionToDelete = reactions.find((reaction) => reaction.role.id === role.id) || null;
      } else {
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

        reactionToDelete = reactions.find((reaction) => (
          (typeof reaction.emoji === 'string' && isNative && reaction.emoji === params[0]) ||
          (reaction.emoji instanceof GuildEmoji && !isNative && reaction.emoji.id === emoji?.id)
        )) || null;
      }

      if (!reactionToDelete) {
        await deleteMessage(await sendMessage(message, 'el emoji o el rol no existe en los roles por reacción.', alias));
        return;
      }

      if (reactions.length === 1) {
        await Settings.remove('reactions_manual');
      } else {
        reactions.splice(reactions.findIndex((x) => x === reactionToDelete), 1);

        await Settings.update('reactions_manual', reactions.map((reaction) => (
          `${reaction.emoji instanceof GuildEmoji ? reaction.emoji.id : reaction.emoji}|||${reaction.role.id}|||${reaction.description}`
        )).join(';;'));
      }

      await deleteMessage(await sendMessage(message, `reacción eliminada, ahora di **${prefix}updaterolesmessage** actualizar el mensaje.`, alias));
    } catch (error) {
      console.error('Remove Reaction Command', error);
    }
  }
}
