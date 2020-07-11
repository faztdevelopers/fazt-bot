// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message, Client } from 'discord.js';

export const sendMessage = async (message: Message, content: string, command: string): Promise<Message | null> => {
  return await message.channel.send(`**[${command.split(' ')[0].toUpperCase()}]** ${message.author}, ${content}`) || null;
};

export const deleteMessage = async (message: Message | null, timeout = 5000): Promise<void> => {
  if (!message) {
    return;
  }

  await message.delete({ timeout });
};

export type CommandGroup = 'developer' | 'general' | 'moderation' | 'music';

interface Command {
  names: Array<string>;
  arguments?: string;
  group: CommandGroup;
  description: string;
  onCommand: (msg: Message, client: Client, params: Array<string>, alias: string) => Promise<void>;
}

export default Command;