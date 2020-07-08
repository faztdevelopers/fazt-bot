import {MessageEmbed} from "discord.js"

export default class {
    embed: MessageEmbed;

    constructor(username: string | undefined, prefix: string) {
        this.embed = new MessageEmbed()
          .setTitle(`${username}: Lista de comandos`)
          .setColor('#009688')
          .setDescription(
            `**${prefix}help/info/commands/comandos**\r\nMira la lista de comandos\r\n\r\n` +
            `**${prefix}suggestion/sugerencia [sugerencia]**\r\nColoca una sugerencia en el canal de sugerencias.`
          )
    }
}