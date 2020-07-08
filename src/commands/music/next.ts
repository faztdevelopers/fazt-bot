import Command, { sendMessage, deleteMessage } from '../command';
import { Message } from 'discord.js';
import * as YouTube from '../../utils/music';

const Next: Command = {
  format: /^(?<command>(next|siguiente|skip))$/,
  execute: async (message: Message, params: { [key: string]: string }) => {
    try {
      if (!message.guild || !message.member) {
        return;
      }

      const musicChannel = await YouTube.isMusicChannel(message);
      if (!musicChannel[0]) {
        await message.delete();
        await deleteMessage(await sendMessage(message, `solo puedes usar comandos de música en ${musicChannel[1]}`, params.command));
        return;
      }

      if (!message.member.voice.channel) {
        await sendMessage(message, 'debes estar en un canal de voz.', params.command);
        return;
      }

      let queue = YouTube.queues[message.guild.id];
      if (!queue || !queue.playing || !queue.playingDispatcher) {
        await sendMessage(message, 'no estoy reproduciendo música.', params.command);
        return;
      }

      if (!queue.voiceChannel.members.has(message.member.id)) {
        await sendMessage(message, 'no estás en el canal de voz.', params.command);
        return;
      }

      if (!queue.songs[1]) {
        await sendMessage(message, 'no hay más canciones en la lista de reproducción', params.command);
        return;
      }

      await YouTube.voteSystem(message, ['next', params.command]);
    } catch (error) {
      console.error('Next song command', error);
    }
  },
};

export default Next;
