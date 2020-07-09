// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';
import { CommandGroup } from 'commands/command';
import { commandsCache, prefix } from '..';

export default class extends MessageEmbed {
  constructor(username: string | undefined, group: CommandGroup | null, isMusicChannel: boolean) {
    super();
    this.title = `${username}: `;

    if (group === 'developer') {
      this.title += 'Comandos para desarrolladores';
    } else if (group === 'moderation') {
      this.title += 'Comandos para moderadores';
    } else if (group === 'general') {
      this.title += 'Comandos generales';
    } else if (group === 'music') {
      this.title += 'Comandos de música';
    } else {
      this.title += 'Lista de comandos';
    }

    this.color = 0x0FF0022;

    if (commandsCache.length) {
      for (const command of commandsCache) {
        if (!group) {
          if (command.group === 'developer' || command.group === 'moderation') {
            continue;
          } else if (isMusicChannel && command.group !== 'music') {
            continue;
          } else if (!isMusicChannel && command.group !== 'general') {
            continue;
          }
        } else if (command.group !== group) {
          continue;
        }

        this.addField(
          `${prefix}${command.names.join('/')}${command.arguments ? ` ${command.arguments}` : ''}`,
          command.description,
          false,
        );
      }
    }
  }
}
