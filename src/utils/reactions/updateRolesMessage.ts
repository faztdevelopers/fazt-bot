// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Client, Guild, GuildChannel, TextChannel, GuildEmoji } from 'discord.js';
import { getByName, remove, create } from '../settings';
import { ReactionPart, getReactions } from '.';
import RolesEmbed from '../../embeds/rolesEmbed';

export default async function updateRolesMessage(
  bot: Client,
  guild: Guild,
): Promise<boolean> {
  const rolesChannelID = await getByName('roles_channel');
  if (!rolesChannelID) {
    return false;
  }

  const rolesChannel: GuildChannel | undefined = guild.channels.cache.get(rolesChannelID.value);
  if (!rolesChannel || !(((o: GuildChannel): o is TextChannel => o.type === 'text')(rolesChannel))) {
    remove('roles_channel');
    return false;
  }

  const messageID = await getByName('roles_message_id');

  const reactions: Array<ReactionPart> = await getReactions(bot, guild);
  if (!reactions.length) {
    if (messageID) {
      const msg = await rolesChannel.messages.fetch(messageID.value);
      if (msg) {
        await msg.delete();
      }

      await remove('roles_message_id');
      return false;
    }

    return false;
  }

  const embed: RolesEmbed = new RolesEmbed(reactions);

  if (!messageID) {
    const msg = await rolesChannel.send(embed);
    if (msg) {
      await create('roles_message_id', msg.id);

      for await (const reaction of reactions) {
        await msg.react(reaction.emoji);
      }
    }
  } else {
    const msg = await rolesChannel.messages.fetch(messageID.value);
    if (msg) {
      await msg.edit(new RolesEmbed(reactions));

      for await (const reaction of reactions) {
        const react: string = reaction.emoji instanceof GuildEmoji ? reaction.emoji.id : reaction.emoji;
        if (!msg.reactions.cache.has(react)) {
          await msg.react(reaction.emoji);
        }
      }

      if (reactions.length < msg.reactions.cache.size) {
        for await (const reaction of msg.reactions.cache.values()) {
          const reactionExists = reactions.find((react) => (
            (react.emoji instanceof GuildEmoji && reaction.emoji.id === react.emoji.id) ||
            (typeof react.emoji === 'string' && reaction.emoji.name === react.emoji)
          ));

          if (reactionExists) {
            continue;
          }

          await reaction.remove();
        }
      }
    }
  }

  return true;
}
