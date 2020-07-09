import {MessageEmbed} from "discord.js"

export default class extends MessageEmbed{
    constructor(username: string | undefined, prefix: string) {
      super()
      this.title = `${username}: Lista de comando`
      this.color = 0x009688
      this.description = `**${prefix}help/info/commands/comandos**\r\nMira la lista de comandos\r\n\r\n`
                        + `**${prefix}suggestion/sugerencia [sugerencia]**\r\nColoca una sugerencia en el canal de sugerencias.`
    }
}