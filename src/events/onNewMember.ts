// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { GuildMember, PartialGuildMember, Client, TextChannel } from 'discord.js';
import { getByName as settingName } from '../utils/settings';
import WelcomeEmbed from '../embeds/welcomeEmbed';

const onNewMember = async (member: GuildMember | PartialGuildMember, bot: Client): Promise<void> => {
  if (!member.user) {
    return;
  }

  const welcomesID: string = (await settingName('welcomes_channel'))?.value || '';
  const welcomesChannel = bot.channels.cache.get(welcomesID);

  const offTopicID: string = (await settingName('off_topic_channel'))?.value || '';
  const offTopicChannel = bot.channels.cache.get(offTopicID);

  if (!welcomesChannel || welcomesChannel.type !== 'text' || !offTopicChannel) {
    return;
  }

  await (welcomesChannel as TextChannel).send(
    new WelcomeEmbed(
      member.guild.name,
      member.user.displayAvatarURL(),
      member.user.toString(),
      member.user.username,
      offTopicChannel.toString()
    )
  );
};

export default onNewMember;
