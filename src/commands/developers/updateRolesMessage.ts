// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { deleteMessage, sendMessage, CommandGroup } from '../command';
import { Message, Client, GuildChannel, TextChannel, Role, GuildEmoji, Guild } from 'discord.js';
import * as Settings from '../../utils/settings';
import emojiRegex from 'emoji-regex';
import RolesEmbed from '../../embeds/rolesEmbed';

export interface ReactionPart {
  emoji: GuildEmoji | string;
  isNative: boolean;
  role: Role;
  description: string;
}

export default class UpdateRolesMessage implements Command {
  names: Array<string> = ['updaterolesmessage'];
  group: CommandGroup = 'developer';
  description = 'Actualiza el mensaje de los roles por reacción.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const devRole: string | null = (await Settings.getByName('developer_role'))?.value || null;
      if (!devRole) {
        return;
      }

      if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(devRole)) {
        return;
      }

      await message.delete();

      const rolesChannelID = await Settings.getByName('roles_channel');
      if (!rolesChannelID) {
        await deleteMessage(await sendMessage(message, 'debes agregar un canal de roles primero.', alias));
        return;
      }

      const rolesChannel: GuildChannel | undefined = message.guild.channels.cache.get(rolesChannelID.value);
      if (!rolesChannel || !(((o: GuildChannel): o is TextChannel => o.type === 'text')(rolesChannel))) {
        await deleteMessage(await sendMessage(message, 'el canal no existe.', alias));
        return;
      }

      const messageID = await Settings.getByName('roles_message_id');

      const currentReactions = await UpdateRolesMessage.getReactions(bot, message.guild);
      if (!currentReactions.length) {
        if (messageID) {
          const msg = await rolesChannel.messages.fetch(messageID.value);
          if (msg) {
            await msg.delete();
          }

          await Settings.remove('roles_message_id');
          await deleteMessage(await sendMessage(message, 'el mensaje ha sido eliminado.', alias));
          return;
        }

        await deleteMessage(await sendMessage(message, 'debes agregar reacciones primero.', alias));
        return;
      }

      if (messageID) {
        const msg = await rolesChannel.messages.fetch(messageID.value);
        if (msg) {
          deleteMessage(await sendMessage(message, `mensaje editado en ${rolesChannel.toString()}.`, alias));
          await msg.edit(new RolesEmbed(currentReactions));

          for await (const reaction of currentReactions) {
            const react: string = reaction.emoji instanceof GuildEmoji ? reaction.emoji.id : reaction.emoji;
            if (!msg.reactions.cache.has(react)) {
              await msg.react(reaction.emoji);
            }
          }

          if (currentReactions.length < msg.reactions.cache.size) {
            for await (const reaction of msg.reactions.cache.values()) {
              const reactionExists = currentReactions.find((react) => (
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
      } else {
        const msg = await rolesChannel.send(new RolesEmbed(currentReactions));
        if (msg) {
          deleteMessage(await sendMessage(message, `mensaje creado en ${rolesChannel.toString()}.`, alias));
          await Settings.create('roles_message_id', msg.id);

          for await (const reaction of currentReactions) {
            await msg.react(reaction.emoji);
          }
        }
      }
    } catch (error) {
      console.error('Update Roles Message Command', error);
      await deleteMessage(await sendMessage(message, 'ha ocurrido un error.', alias));
    }
  }

  static async getReactions(bot: Client, guild: Guild): Promise<Array<ReactionPart>> {
    const data: Array<ReactionPart> = [];

    const currentReactions = await Settings.getByName('reactions_manual');
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

          data.push({ emoji, isNative, role, description: subParts[2] });
        }
      }
    }

    return data;
  }
}
