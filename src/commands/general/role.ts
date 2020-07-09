import Command, { CommandGroup, sendMessage } from '../command';
import { Message, Client, Role } from 'discord.js';
import RolesEmbed from '../../embeds/RolesEmbed';

export default class Roles implements Command {
  format: RegExp = /^(?<command>(role)+(\s(?<type>[\s\S]+))?)$/;
  names: Array<string> = ['role'];
  arguments: string = '(info/a/b/c/d/e/remove/list)';
  group: CommandGroup = 'general';
  description: string = 'Colócate un rol.';

  async onCommand(message: Message, bot: Client, params: { [key: string]: string }) {
    try {
      if (!message.member) {
        return;
      }

      const role: string = params.type;
      if (!role) {
        await sendMessage(message, 'debes especificar un rol.', params.command);
        return;
      }

      switch (role) {
        case 'info': {
          await message.channel.send(new RolesEmbed(bot.user?.username || ''));
          break;
        }

        case 'list': {
          const roles: string[] = message.member.roles.cache.filter((r) => r.name !== '@everyone').map((r) => r.name);
          await sendMessage(message, `tus roles son:\r\n${roles.map((r) => `🏅 ${r}`).join('\r\n')}`, params.command);
          break;
        }

        case 'remove': {
          const roles = message.member.roles.cache.filter((role) => (
            role.name === 'Dev FullStack' || role.name === 'Dev Backend' ||
            role.name === 'Dev Mobile' || role.name === 'Dev Games' ||
            role.name === 'Dev Frontend' || role.name === 'Taller' ||
            role.name === 'Warning'
          ));

          if (!roles.size) {
            await sendMessage(message, 'no tienes roles para eliminar.', params.command);
            return;
          }

          await message.member.roles.remove(roles);
          await sendMessage(message, 'tus roles fueron eliminados.', params.command);
          break;
        }

        default: {
          const addRole = async (name: string): Promise<void> => {
            if (!message.guild || !message.member) {
              return;
            }

            const role: Role | undefined = message.guild.roles.cache.find((r) => r.name === name);
            if (!role) {
              throw new Error('The rol does not exist.');
            }

            await message.member.roles.add(role);
          };

          if (role === 'a') {
            await addRole('Dev FullStack');
            await sendMessage(message, 'ahora tienes el rol de **Desarrollador FullStack**', params.command);
          } else if (role === 'b') {
            await addRole('Dev Backend');
            await sendMessage(message, 'ahora tienes el rol de **Desarrollador Backend**', params.command);
          } else if (role === 'c') {
            await addRole('Dev Mobile');
            await sendMessage(message, 'ahora tienes el rol de **Desarrollador de Aplicaciones Móviles**', params.command);
          } else if (role === 'd') {
            await addRole('Dev Games');
            await sendMessage(message, 'ahora tienes el rol de **Desarrollador de Videojuegos**', params.command);
          } else if (role === 'e') {
            await addRole('Dev Frontend');
            await sendMessage(message, 'ahora tienes el rol de **Desarrollador Frontend**', params.command);
          } else if (role === 'f') {
            await addRole('Taller');
            await sendMessage(message, 'ahora tienes el rol de **Taller**', params.command);
          } else {
            await sendMessage(message, 'el rol no es válido', params.command);
          }

          break;
        }
      }
    } catch (error) {
      console.error('Role Command', error);
    }
  };
}
