// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import AvatarEmbed from '../../embeds/avatarEmbed';

export default class Avatar implements Command {
  names: Array<string> = ['avatar'];
  arguments = '(mensaje)';
  group: CommandGroup = 'general';
  description = 'Muestra tu avatar.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      await message.channel.send(
        new AvatarEmbed(
          message.author.username,
          message.author.displayAvatarURL(),
        )
      );
    } catch (error) {
      console.error('Avatar error', error);
    }
  }
}

