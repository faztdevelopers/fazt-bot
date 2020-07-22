// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';
import { ReactionPart } from '../commands/developers/updateRolesMessage';

export default class RolesEmbed extends MessageEmbed {
  constructor(reactions: Array<ReactionPart>) {
    super();

    this.color = 0xFF0022;
    this.title = 'Roles disponibles';
    this.description = `Reacciona con el emoji para obtener el rol.\r\n\r\n${reactions.map((reaction) => (
      `${reaction.emoji} ${reaction.role.toString()} ${reaction.description}`
    )).join('\r\n')}`;
    this.footer = { text: 'Fazt Tech' };
  }
}
