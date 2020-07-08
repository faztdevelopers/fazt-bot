import Command, { sendMessage, deleteMessage } from '../command';
import { Message, MessageEmbed, GuildChannel, TextChannel, Client } from 'discord.js';
import { getByName } from '../../utils/settings';

const Suggest: Command = {
  format: /^(?<command>(sugerencia|suggestion)+(\s(?<message>[\s\S]+))?)/,
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

      const msg = await (suggestionChannel as TextChannel).send(
        new MessageEmbed()
          .setTitle('Nueva sugerencia')
          .setColor('#009688')
          .setDescription(`${params.message}\r\n\r\n**Sugerencia por: ** ${message.author} (${message.author.username})`)
          .setTimestamp(Date.now())
      );

      deleteMessage(await sendMessage(message, `Tu sugerencia se ha enviado a ${(suggestionChannel as TextChannel)}.`, params.command));

      await msg.react(bot.emojis.cache.find((e) => e.name === 'check_2'));
      await msg.react(bot.emojis.cache.find((e) => e.name === 'x2'));
    } catch (error) {
      console.error('Suggest error', error);
    }
  },
};

export default Suggest;
