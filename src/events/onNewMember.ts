// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { GuildMember, PartialGuildMember, Client, Channel, TextChannel } from 'discord.js';
import { getByName } from '../utils/settings';
import WelcomeEmbed from '../embeds/welcomeEmbed';

export default async function onNewMember (member: GuildMember | PartialGuildMember, bot: Client): Promise<void> {
  if (!member.user) {
    return;
  }

  if (member.user.partial) {
    await member.user.fetch();
  }

  // Send private message to user direct message
  const welcomePrivateMessage = await getByName('dm_welcomes_message');
  if (welcomePrivateMessage) {
    await (member.user.dmChannel || await member.user.createDM()).send(
      new WelcomeEmbed(
        'private',
        '',
        welcomePrivateMessage.value
          .replace(/{@mention}/gi, member.user.toString())
          .replace(/{@username}/gi, member.user.username),
        member.guild,
      )
    );
  }

  // Send public message to welcomes channel
  const welcomesChannelID = await getByName('welcomes_channel');
  if (!welcomesChannelID) {
    return;
  }

  const welcomesChannel = bot.channels.cache.get(welcomesChannelID.value);
  if (!welcomesChannel || !(((o: Channel): o is TextChannel => o.type === 'text')(welcomesChannel))) {
    return;
  }

  const welcomePublicMessage = await getByName('welcomes_message');
  if (!welcomePublicMessage) {
    return;
  }

  await welcomesChannel.send(
    new WelcomeEmbed(
      'public',
      member.user.displayAvatarURL(),
      welcomePublicMessage.value
        .replace(/{@mention}/gi, member.user.toString())
        .replace(/{@username}/gi, member.user.username),
      member.guild,
    ),
  );
}
