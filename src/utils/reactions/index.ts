// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { GuildEmoji, Role, Client, Guild } from 'discord.js';
import { getByName } from '../settings';
import emojiRegex from 'emoji-regex';

export interface ReactionPart {
  emoji: GuildEmoji | string;
  isNative: boolean;
  role: Role;
  description: string;
  removeWarning?: boolean;
}

export async function getReactions(bot: Client, guild: Guild): Promise<Array<ReactionPart>> {
  const data: Array<ReactionPart> = [];

  const currentReactions = await getByName('reactions_manual');
  if (currentReactions) {
    const parts: Array<string> = currentReactions.value.split(';;');
    if (parts.length) {
      for (const part of parts) {
        const subParts: Array<string> = part.split('|||');

        let emoji: GuildEmoji | string = subParts[0];
        const isNative: boolean = (emoji.match(emojiRegex()) || []).length >= 1;

        if (!isNative) {
          const guildEmoji = bot.emojis.cache.get(emoji);
          if (!guildEmoji) {
            continue;
          }

          emoji = guildEmoji;
        }

        const role: Role | null = guild.roles.cache.get(subParts[1]) || null;
        if (!role) {
          continue;
        }

        data.push({
          emoji,
          isNative,
          role,
          description: subParts[2],
          removeWarning: subParts[3] === 'true',
        });
      }
    }
  }

  return data;
}
