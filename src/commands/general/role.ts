// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import Command, { CommandGroup, sendMessage } from '../command';
import { Message, Client, Role } from 'discord.js';
import RolesEmbed from '../../embeds/RolesEmbed';

export default class Roles implements Command {
  names: Array<string> = ['role'];
  arguments = '(info/remove/list/fullstack/backend/frontend/juegos/móvil/taller)';
  group: CommandGroup = 'general';
  description = 'Colócate un rol.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!message.member) {
        return;
      }

      const role: string = (params[1] || '').toLowerCase();
      if (!role || !role.length) {
        await sendMessage(message, 'debes especificar un rol.', params[0]);
        return;
      }

      switch (role) {
        case 'info': {
          await message.channel.send(new RolesEmbed(bot.user?.username || ''));
          break;
        }

        case 'list': {
          const roles: string[] = message.member.roles.cache.filter((r) => r.name !== '@everyone').map((r) => r.name);
          await sendMessage(message, `tus roles son:\r\n${roles.map((r) => `🏅 ${r}`).join('\r\n')}`, params[0]);
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
            await sendMessage(message, 'no tienes roles para eliminar.', params[0]);
            return;
          }

          await message.member.roles.remove(roles);
          await sendMessage(message, 'tus roles fueron eliminados.', params[0]);
          break;
        }

        default: {
          const addRole = async (name: string): Promise<boolean> => {
            if (!message.guild || !message.member) {
              return false;
            }

            const role: Role | undefined = message.guild.roles.cache.find((r) => r.name === name);
            if (!role) {
              throw new Error('The rol does not exist.');
            }

            if (message.member.roles.cache.has(role.id)) {
              await sendMessage(message, 'ya posees este rol.', params[0]);
              return false;
            }

            await message.member.roles.add(role);
            return true;
          };

          if (role === 'a' || role === 'fullstack') {
            if (await addRole('Dev FullStack')) {
              await sendMessage(message, 'ahora tienes el rol de **Desarrollador FullStack**', params[0]);
            }
          } else if (role === 'b' || role === 'backend') {
            if (await addRole('Dev Backend')) {
              await sendMessage(message, 'ahora tienes el rol de **Desarrollador Backend**', params[0]);
            }
          } else if (role === 'c' || role === 'mobile' || role === 'móvil') {
            if (await addRole('Dev Mobile')) {
              await sendMessage(message, 'ahora tienes el rol de **Desarrollador de Aplicaciones Móviles**', params[0]);
            }
          } else if (role === 'd' || role === 'games' || role === 'juegos') {
            if (await addRole('Dev Games')) {
              await sendMessage(message, 'ahora tienes el rol de **Desarrollador de Videojuegos**', params[0]);
            }
          } else if (role === 'e' || role === 'frontend') {
            if (await addRole('Dev Frontend')) {
              await sendMessage(message, 'ahora tienes el rol de **Desarrollador Frontend**', params[0]);
            }
          } else if (role === 'f' || role === 'taller') {
            if (await addRole('Taller')) {
              await sendMessage(message, 'ahora tienes el rol de **Taller**', params[0]);
            }
          } else {
            await sendMessage(message, 'el rol no es válido.', params[0]);
          }

          break;
        }
      }
    } catch (error) {
      console.error('Role Command', error);
    }
  }
}
