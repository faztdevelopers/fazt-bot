import Command, { sendMessage, deleteMessage, CommandGroup } from '../command';
import { Message, Client } from 'discord.js';
import * as YouTube from '../../utils/music';

export default class StopCommand implements Command {
  names: Array<string> = ['stop', 'parar'];
  group: CommandGroup = 'music';
  description: string = 'Para de reproducir música. (Si hay más de 2 oyentes se hará votación)';

  async onCommand(message: Message, bot: Client, params: Array<string>) {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params[0]));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'no estás en un canal de voz.', params[0]);
        return;
      }

      const queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', params[0]);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', params[0]);
        return;
      }

      await YouTube.voteSystem(message, ['stop', params[0]], params[1].toLowerCase() === 'forced');
    } catch (error) {
      console.error('Stop Command', error);
    }
  }
}
