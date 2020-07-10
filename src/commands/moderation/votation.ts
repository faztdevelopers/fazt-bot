// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, GuildChannel, TextChannel, Client } from 'discord.js';
import * as Settings from '../../utils/settings';
import votationEmbed from '../../embeds/votationEmbed';

export default class Votation implements Command {
  names: Array<string> = ['votacion', 'votation', 'vote'];
  arguments = '(mensaje)';
  group: CommandGroup = 'moderation';
  description = 'Realiza una nueva votacion para la comunidad.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const moderatorRole: string | null = (await Settings.getByName('moderator_role'))?.value || null;
      if (!message.member.hasPermission('ADMINISTRATOR') || (moderatorRole && !message.member.roles.cache.has(moderatorRole))) {
        return;
      }

      const channelID: string = (await Settings.getByName('votation_channel'))?.value || '';
      if (!channelID.length) {
        return;
      }

      const votationChannel: GuildChannel | undefined = message.guild.channels.cache.get(channelID);
      if (!votationChannel || !((o: GuildChannel): o is TextChannel => o.type === 'text')) {
        return;
      }

      await message.delete();

      let msg: string = params.slice(1).join(' ');

      if (!msg) {
        await deleteMessage(await sendMessage(message, 'la votacion está vacía.', params[0]));
        return;
      }

      const urlInParams = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+');

      const url: string[] = [];

      const urlCheck = msg.match(urlInParams);
      if (urlCheck) {
        const urlIndex = url.push(urlCheck[0]);
        msg = msg.replace(url[urlIndex - 1], '');
      }

      const embedMessage = await (votationChannel as TextChannel).send(new votationEmbed(msg, message.author, url));

      deleteMessage(await sendMessage(message, `Tu votacion se ha enviado a ${(votationChannel as TextChannel)}.`, params[0]));

      await embedMessage.react(bot.emojis.cache.find((e) => e.name === 'check_2') || '👍');
      await embedMessage.react(bot.emojis.cache.find((e) => e.name === 'x2') || '👎');
    } catch (error) {
      console.error('Votacion error', error);
    }
  }
}
