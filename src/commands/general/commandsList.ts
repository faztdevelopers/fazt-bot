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
          .setDescription(`Prefijo: ${prefix}`),
      );
    } catch (error) {
      console.error('Commands Lists', error);
    }
  },
};

export default CommandsList;
