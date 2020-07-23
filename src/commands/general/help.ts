// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import BotDescriptionEmbed from '../../embeds/botDescriptionEmbed';
import { isMusicChannel } from '../../utils/music';

export default class CommandsList implements Command {
  names: Array<string> = ['info', 'help', 'commands', 'comandos'];
  arguments = '(música/general)';
  group: CommandGroup = 'general';
  description = 'Mira la lista de comandos.';

  async onCommand(message: Message, client: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      let group: CommandGroup | null = null;
      if (params[0] === 'música' || params[0] === 'music') {
        group = 'music';
      } else if (params[0] === 'general') {
        group = 'general';
      } else if (params[0] === 'developer' || params[0] === 'desarrollo' || params[0] === 'dev') {
        const devRole: string | null = (await getByName('developer_role'))?.value || null;
        if (!devRole) {
          return;
        }

        if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(devRole)) {
          return;
        }

        group = 'developer';
      } else if (params[0] === 'contributors' || params[0] === 'contributor' || params[0] === 'contribuidores') {
        const contributorRole: string | null = (await getByName('contributor_role'))?.value || null;
        if (!contributorRole) {
          return;
        }
  
        if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(contributorRole)) {
          return;
        }

        group = 'contributors';
      } else if (params[0] === 'moderation' || params[0] === 'moderación' || params[0] === 'mod') {
        const modRole: string | null = (await getByName('moderator_role'))?.value || null;
        if (!modRole) {
          return;
        }

        if (!message.member.hasPermission('ADMINISTRATOR') && !message.member.roles.cache.has(modRole)) {
          return;
        }

        group = 'moderation';
      }

      await message.channel.send(new BotDescriptionEmbed(client.user?.username, group, (await isMusicChannel(message))[0]));
    } catch (error) {
      console.error('Commands Lists', error);
    }
  }
}
