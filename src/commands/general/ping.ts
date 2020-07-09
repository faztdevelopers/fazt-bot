import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import moment from 'moment';

export default class Ping implements Command {
  format: RegExp = /^(?<command>(ping))$/;
  names: string[] = ['ping'];
  group: CommandGroup = 'general';
  description: string = 'Ping pong...';

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    await message.channel.send(`Pong! 🚀 (${moment(message.createdTimestamp).diff(moment(Date.now()), 'millisecond')}ms)`);
  };
}
