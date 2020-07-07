import { Message } from 'discord.js';

export default interface Command {
  format: RegExp;
  execute: (message: Message, params: { [key: string]: string }) => Promise<void>;
}
