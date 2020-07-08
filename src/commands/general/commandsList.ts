import Command from '../command';
import { Message, MessageEmbed } from 'discord.js';
import { bot, prefix } from '../..';

const CommandsList: Command = {
  format: /^(?<command>(info|help|commands|comandos))$/,
  execute: async (message: Message, params: { [key: string]: string }): Promise<void> => {
    try {
      if (!message.guild) {
        return;
      }

      await message.channel.send(
        new MessageEmbed()
          .setTitle(`${bot.user?.username}: Lista de comandos`)
          .setColor('#009688')
          .setDescription(
            `**${prefix}help/info/commands/comandos**\r\nMira la lista de comandos\r\n\r\n` +
            `**${prefix}suggestion/sugerencia [sugerencia]**\r\nColoca una sugerencia en el canal de sugerencias.`
          ),
      );
    } catch (error) {
      console.error('Commands Lists', error);
    } /// Wja
  },
};

export default CommandsList;
