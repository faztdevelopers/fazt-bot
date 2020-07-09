import Command, { CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import { getByName } from '../../utils/settings';
import BotDescriptionEmbed from '../../embeds/BotDescriptionEmbed';
import { isMusicChannel } from '../../utils/music';

export default class CommandsList implements Command {
  format: RegExp = /^((?<command>(info|help|commands|comandos))+(\s(?<type>(música|music|general|developer|desarrollo|moderation|moderación|mod|dev)))?)$/;
  names: string[] = ['info', 'help', 'commands', 'comandos'];
  arguments: string = '(música/general)';
  group: CommandGroup = 'general';
  description: string = 'Mira la lista de comandos.';

  async onCommand(message: Message, client: Client, params: { [key: string]: string }): Promise<void> {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      let group: CommandGroup | null = null;
      if (params.type === 'música' || params.type === 'music') {
        group = 'music';
      } else if (params.type === 'general') {
        group = 'general';
      } else if (params.type === 'developer' || params.type === 'desarrollo' || params.type === 'dev') {
        const devRole: string | null = (await getByName('developer_role'))?.value || null;
        if (!message.member.hasPermission('ADMINISTRATOR') || (devRole && !message.member.roles.cache.has(devRole))) {
          return;
        }

        group = 'developer';
      } else if (params.type === 'moderation' || params.type === 'moderación' || params.type === 'mod') {
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
