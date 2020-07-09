import Command from '../command';
import { Message, Client } from 'discord.js';
import { prefix } from '../..';
import BotDescriptionEmbed from "../../embeds/BotDescriptionEmbed"

export default class CommandsList implements Command {
  format = /^(?<command>(info|help|commands|comandos))$/;

  async onCommand(message: Message, client: Client, params: { [key: string]: string }): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      await message.channel.send(new BotDescriptionEmbed(client.user?.username, prefix));
    } catch (error) {
      console.error('Commands Lists', error);
    }
  }
}
