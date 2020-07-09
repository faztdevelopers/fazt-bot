import { MessageEmbed } from 'discord.js';

export default class extends MessageEmbed {
  constructor(username: string | undefined, prefix: string) {
    super()
    this.title = `${username}: Lista de comandos`;
    this.color = 0x0FF0022;
    this.fields = [
      {
        name: `${prefix}help/info/commands/comandos`,
        value: 'Mira la lista de comandos.',
        inline: false,
      },
      {
        name: `${prefix}suggestion/sugerencia`,
        value: 'Coloca una sugerencia en el canal de sugerencias.',
        inline: false,
      },
      {
        name: `${prefix}ascii/figlet`,
        value: 'Responde con el mismo mensaje en ascii',
        inline: false,
      }
    ];
  }
}
