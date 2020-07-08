import { Message } from 'discord.js';

export const sendMessage = async (message: Message, content: string, command: string): Promise<Message | null> => {
  return await message.channel.send(`**[${command.toUpperCase()}]** ${message.author}, ${content}`) || null;
};

export const deleteMessage = async (message: Message | null, timeout: number = 5000): Promise<void> => {
  if (!message) {
    return;
  }

  await message.delete({ timeout });
}

export default interface Command {
  format: RegExp;
  execute: (message: Message, params: { [key: string]: string }) => Promise<void>;
}
