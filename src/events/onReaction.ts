// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageReaction, User, PartialUser, Client, GuildEmoji } from 'discord.js';
import { getByName } from '../utils/settings';
import { ReactionPart, getReactions } from '../utils/reactions';

export default async function onReaction(
  type: 'add' | 'remove',
  reaction: MessageReaction,
  user: User | PartialUser,
  bot: Client
): Promise<void> {  
  if (!reaction.message.guild || user.bot) {
    return;
  }

  const currentReactions: Array<ReactionPart> = await getReactions(bot, reaction.message.guild);
  if (!currentReactions.length) {
    return;
  }

  const messageID = await getByName('roles_message_id');
  if (!messageID) {
    return;
  }

  if (reaction.partial) {
    await reaction.fetch();
  }

  if (user.partial) {
    await user.fetch();
  }

  const member = reaction.message.guild.members.cache.get(user.id);
  if (!member) {
    return;
  }

  for await (const react of currentReactions) {
    let isValid = false;
    if (typeof react.emoji === 'string' && react.emoji === reaction.emoji.name) {
      isValid = true;
    } else if (react.emoji instanceof GuildEmoji && react.emoji.id === reaction.emoji.id) {
      isValid = true;
    }

    if (!isValid) {
      continue;
    }

    if (type === 'add') {
      if (react.removeWarning === true) {
        await reaction.users.remove(user.id);

        const warningRoleID = await getByName('warning_role');
        if (warningRoleID && member.roles.cache.has(warningRoleID.value)) {
          await member.roles.remove(warningRoleID.value);
        }
      } else if (!member.roles.cache.has(react.role.id)) {
        await member.roles.add(react.role);
      }
    } else {
      if (member.roles.cache.has(react.role.id)) {
        await member.roles.remove(react.role);
      }
    }
  }
};
