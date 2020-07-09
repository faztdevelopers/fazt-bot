import Command, { sendMessage, deleteMessage } from '../command';
import { Message, GuildChannel, TextChannel, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import SuggestionEmbed from '../../embeds/SuggestionEmbed';
import figlet from 'figlet';

export default class Suggest implements Command {
  format = /^(?<command>(ascii|figlet)+(\s(?<message>[\s\S]+))?)/;

  async onCommand(
    message: Message,
    bot: Client,
    params: { [key: string]: string }
  ): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      if (!params.message) {
        await deleteMessage(
          await sendMessage(
            message,
            'debes colocar un mensaje.',
            params.command
          )
        );
        return;
      }

      const text = figlet.textSync(params.message);

      await sendMessage(message, '```' + text + '```', params.command);
    } catch (error) {
      console.error('Suggest error', error);
    }
  }
}
