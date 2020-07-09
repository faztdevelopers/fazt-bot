import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, GuildChannel, TextChannel, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import SuggestionEmbed from '../../embeds/SuggestionEmbed';

export default class Suggest implements Command {
  format: RegExp = /^((?<command>(sugerencia|suggestion))+(\s(?<message>[\s\S]+))?)$/;
  names: string[] = ['sugerencia', 'suggestion'];
  arguments: string = '(mensaje)';
  group: CommandGroup = 'general';
  description: string = 'Realiza una nueva sugerencia para el servidor.';

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }): Promise<void> {
    try {
      if (!message.guild) {
        return;
      }

      const channelID: string = (await getByName('suggestion_channel'))?.value || '';
      if (!channelID.length) {
        return;
      }

      const suggestionChannel: GuildChannel | undefined = message.guild.channels.cache.get(channelID);
      if (!suggestionChannel || !((o: GuildChannel): o is TextChannel => o.type === 'text')) {
        return;
      }

      await message.delete();

      if (!params.message) {
        await deleteMessage(await sendMessage(message, 'la sugerencia está vacía.', params.command));
        return;
      }

      const msg = await (suggestionChannel as TextChannel).send(new SuggestionEmbed(params.message, message.author));

      deleteMessage(await sendMessage(message, `Tu sugerencia se ha enviado a ${(suggestionChannel as TextChannel)}.`, params.command));

      await msg.react(bot.emojis.cache.find((e) => e.name === 'check_2') || '');
      await msg.react(bot.emojis.cache.find((e) => e.name === 'x2') || '');
    } catch (error) {
      console.error('Suggest error', error);
    }
  }
}
