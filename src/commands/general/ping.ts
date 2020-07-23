// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import moment from 'moment';

export default class Ping implements Command {
  names: Array<string> = ['ping'];
  group: CommandGroup = 'general';
  description = 'Ping pong...';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      await message.channel.send(`Pong! 🚀 (${moment(message.createdTimestamp).diff(moment(Date.now()), 'millisecond')}ms)`);
    } catch (error) {
      console.error('Ping Command', error);
    }
  }
}
