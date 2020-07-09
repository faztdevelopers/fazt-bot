// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import figlet from 'figlet';

export default class Ascii implements Command {
  names: Array<string> = ['ascii', 'figlet'];
  arguments = '(mensaje)';
  group: CommandGroup = 'general';
  description = 'Coloca un mensaje en código ASCII.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      const msg: string = params.slice(1).join(' ');
      if (!msg) {
        await deleteMessage(await sendMessage(message, 'debes colocar un mensaje.', params[0]));
        return;
      }

      const text = figlet.textSync(msg);

      await sendMessage(message, '```' + text + '```', params[0]);
    } catch (error) {
      console.error('Suggest error', error);
    }
  }
}
