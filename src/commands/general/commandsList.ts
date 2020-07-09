import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import BotDescriptionEmbed from '../../embeds/BotDescriptionEmbed';
import { isMusicChannel } from '../../utils/music';

export default class CommandsList implements Command {
  names: Array<string> = ['info', 'help', 'commands', 'comandos'];
  arguments = '(música/general)';
  group: CommandGroup = 'general';
  description = 'Mira la lista de comandos.';

  async onCommand(message: Message, client: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      let group: CommandGroup | null = null;
      if (params[1] === 'música' || params[1] === 'music') {
        group = 'music';
      } else if (params[1] === 'general') {
        group = 'general';
      } else if (params[1] === 'developer' || params[1] === 'desarrollo' || params[1] === 'dev') {
        const devRole: string | null = (await getByName('developer_role'))?.value || null;
        if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
          return;
        }

        group = 'developer';
      } else if (params[1] === 'moderation' || params[1] === 'moderación' || params[1] === 'mod') {
        const devRole: string | null = (await getByName('moderation_role'))?.value || null;
        if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
          return;
        }

        group = 'moderation';
      }

      await message.channel.send(new BotDescriptionEmbed(client.user?.username, group, (await isMusicChannel(message))[0]));
    } catch (error) {
      console.error('Commands Lists', error);
    }
  }
}
