// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { getByName } from '../utils/settings';
import { MessageReaction, User, PartialUser, Client, GuildEmoji } from 'discord.js';
import UpdateRolesMessage from '../commands/developers/updateRolesMessage';

const onReaction = async (type: 'add' | 'remove', reaction: MessageReaction, user: User | PartialUser, bot: Client): Promise<void> => {  
  if (!reaction.message.guild || user.bot) {
    return;
  }

  const currentReactions = await UpdateRolesMessage.getReactions(bot, reaction.message.guild);
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
      if (!member.roles.cache.has(react.role.id)) {
        await member.roles.add(react.role);
      }
    } else {
      if (member.roles.cache.has(react.role.id)) {
        await member.roles.remove(react.role);
      }
    }
  }
};

export default onReaction;
