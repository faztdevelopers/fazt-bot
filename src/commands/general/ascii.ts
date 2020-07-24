// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import figlet from 'figlet';

export default class Ascii implements Command {
  names: Array<string> = ['ascii', 'figlet'];
  arguments = '(mensaje)';
  group: CommandGroup = 'general';
  description = 'Coloca un mensaje en código ASCII.';

  async onCommand(message: Message, bot: Client, alias: string, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      const msg: string = params.join(' ');
      if (!msg) {
        await deleteMessage(await sendMessage(message, 'debes colocar un mensaje.', alias));
        return;
      }

      const text = figlet.textSync(msg);

      await sendMessage(message, '```' + text + '```', alias);
    } catch (error) {
      console.error('Ascii error', error);
    }
  }
}
