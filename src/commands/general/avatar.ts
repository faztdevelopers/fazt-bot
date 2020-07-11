// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, GuildChannel, TextChannel, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import AvatarEmbed from '../../embeds/avatarEmbed';

export default class Avatar implements Command {
  names: Array<string> = ['avatar'];
  arguments = '(mensaje)';
  group: CommandGroup = 'general';
  description = 'Muestra tu avatar.';

  async onCommand(message: Message): Promise<void> {
    try {
      if (!message.guild) {        
        return;
      }

      await message.delete();

      const author: string = message.author.username;
      const avatar: string = await message.author.displayAvatarURL(); 

      await message.channel.send(new AvatarEmbed(author, avatar));

    } catch (error) {
      console.error('Avatar error', error);
    }
  }
}
 
