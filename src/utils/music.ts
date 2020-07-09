import { config } from 'dotenv';
import { TextChannel, VoiceChannel, VoiceConnection, StreamDispatcher, MessageEmbed, DMChannel, NewsChannel, Message, MessageReaction, User, UserFlags, GuildChannel, GuildEmoji } from 'discord.js';
import { getByName as settingName } from '../utils/settings';
import YTDL from 'ytdl-core';
import { bot } from '..';
import { sendMessage } from '../commands/command';
const YouTube = require('simple-youtube-api');

config();

export interface IQueue {
  textChannel: TextChannel | DMChannel | NewsChannel;
  voiceChannel: VoiceChannel;
  connection: VoiceConnection;
  playing: boolean;
  playingDispatcher: StreamDispatcher | null;
  stopped: boolean;
  songs: any[];
  skip?: number;
  hasVote: boolean;
}

export const queues: { [guildID: string]: IQueue } = {};

export const filterTitle = (title: string): string => (
  title
    .replace(/&#39;/gi, '\'')
    .replace(/&amp;/gi, '&')
);

export const timeToString = (time: number): string => {
  let str = '';
  let timeLeft: number = time;

  const hours: number = Math.floor(timeLeft / (60 * 60));
  if (hours > 0) {
    str += `${`0${hours}`.substr(-2)}:`;
    timeLeft -= hours;
  }

  const minutes: number = Math.floor(timeLeft / 60);
  if (minutes > 0) {
    str += `${`0${minutes}`.substr(-2)}:`;
    timeLeft -= minutes;
  } else {
    str += '00:';
  }

  if (timeLeft < 0) {
    timeLeft = 0;
  }

  return `${str}${`0${timeLeft}`.substr(-2)}`;
};

export const isMusicChannel = async (message: Message): Promise<[boolean, null | GuildChannel]> => {
  try {
    if (!message.guild) {
      return [false, null];
    }

    const musicChannel: string = (await settingName('music_channel'))?.value ?? '';
    if (musicChannel || musicChannel.length > 0) {
      const channel = message.guild.channels.cache.get(musicChannel);
      if (!channel) {
        return [true, null];
      }

      if (message.channel.id !== musicChannel) {
        return [false, channel];
      }

      return [true, channel];
    }

    return [true, null];
  } catch (error) {
    await Promise.reject(error);
    return [false, null];
  }
};

export const play = async (guildID: string): Promise<boolean> => {
  const queue: IQueue = queues[guildID];
  if (!queue) {
    return false;
  }

  if (queue.playingDispatcher && queue.playing) {
    queue.playing = false;
    queue.stopped = false;
    queue.playingDispatcher.end();
    queue.playingDispatcher = null;
    return true;
  }

  const nextSong: any = queue.songs[0];
  if (!nextSong) {
    return false;
  }

  queue.playing = true;

  const songURL = `https://www.youtube.com/watch?v=${nextSong.id}`;

  const message = await queue.textChannel.send(
    new MessageEmbed()
      .setAuthor(
        `Reproducción: ${filterTitle(nextSong.title)}`,
        nextSong.thumbnails.default.url,
        songURL,
      )
      .setColor('#f44336')
      .setDescription(`${nextSong.description.substr(0, 200)}${nextSong.description.length > 200 ? '...' : ''}`)
      .setFooter(nextSong.channel.title)
      .setTimestamp(Date.now())
  );

  const stream = YTDL(songURL, {
    filter: 'audioonly',
  });

  let onStreamError = false;

  stream.on('error', (error) => {
    onStreamError = true;
    console.log('Stream Error', error);

    message.edit(`${bot.emojis.cache.find((e) => e.name === 'x_')} Couldn't play ${filterTitle(nextSong.title)}`);

    if (queue.playingDispatcher) {
      queue.playingDispatcher.end();
      queue.playingDispatcher = null;
    }

    queue.songs.shift();
    queue.playing = false;
    queue.stopped = false;
  });

  queue.playingDispatcher = queue.connection.play(stream);

  let volume = 6;

  const volumeSetting: string | null = (await settingName('volume_bot'))?.value || null;
  if (volumeSetting != null && !isNaN(Number(volumeSetting))) {
    volume = Number(volumeSetting);
  }

  if (volume > 10) {
    volume = 10;
  } else if (volume < 1) {
    volume = 1;
  }

  queue.playingDispatcher.setVolumeLogarithmic(volume / 5);

  queue.playingDispatcher.on('finish', () => {
    if (!queue.stopped || onStreamError) {
      if (queue.playingDispatcher) {
        queue.playingDispatcher.end();
        queue.playingDispatcher = null;
      }

      queue.playing = false;
      queue.stopped = false;

      if (queue.skip) {
        queue.songs.splice(0, queue.skip - 1);
        queue.skip = undefined;
      } else {
        queue.songs.shift();
      }

      if (queue.songs[0]) {
        play(guildID);
      } else {
        queue.voiceChannel.leave();
        delete queues[guildID];
      }
    }
  });

  queue.playingDispatcher.on('error', (error) => {
    console.log('Dispatch Error', error);

    if (!queue.stopped) {
      if (queue.playingDispatcher) {
        queue.playingDispatcher.end();
        queue.playingDispatcher = null;
      }

      queue.playing = false;

      if (queue.skip) {
        queue.songs.splice(0, queue.skip - 1);
        queue.skip = undefined;
      } else {
        queue.songs.shift();
      }

      if (queue.songs[0]) {
        play(guildID);
      } else {
        queue.voiceChannel.leave();
        delete queues[guildID];
      }
    }
  });

  return true;
};

export const voteSystem = async (message: Message, command: string[], extra: { [key: string]: string } = {}): Promise<boolean> => {
  if (!message.guild) {
    return false;
  }

  const queue: IQueue = queues[message.guild.id];
  if (!queue) {
    return false;
  }

  if (queue.hasVote) {
    await sendMessage(message, 'ya hay una votación.', command[1]);
    return false;
  }

  const memberCount: number = queue.voiceChannel.members.size;
  if (memberCount <= 3) {
    if (command[0].toLowerCase() !== 'next') {
      if (command[0].toLowerCase() === 'stop') {
        queue.stopped = true;

        await sendMessage(message, 'he parado de reproducir música.', command[1]);
      } else if (command[0].toLowerCase() === 'remove') {
        const i = Number(extra.song_index);
        delete extra.song_index;

        queue.songs.splice(i, 1);

        await sendMessage(message, `la canción **${extra.song_name}** de **${extra.song_author}** ha sido eliminada de la lista de reproducción.`, command[1]);
      }
    }

    if (command[0].toLowerCase() !== 'remove') {
      if (queue.playing && queue.playingDispatcher) {
        queue.playingDispatcher.end();
        queue.playingDispatcher = null;
      }
    }

    queue.playing = false;
    return true;
  }

  queue.hasVote = true;

  const approveEmoji: GuildEmoji | null = bot.emojis.cache.find((e) => e.name === 'check_2') || null;
  const disapproveEmoji: GuildEmoji | null = bot.emojis.cache.find((e) => e.name === 'x2') || null;

  const extraMessage = `Vota con (${approveEmoji || ''}) para aceptarlo o con (${disapproveEmoji || ''}) para rechazarlo.`;
  let msg: Message | null = null;

  if (command[0].toLowerCase() === 'next') {
    msg = await message.channel.send(`**[${command[1].toUpperCase()}]** ${message.author}, ha solicitado el cambio de canción. ${extraMessage}`);
  } else if (command[0].toLowerCase() === 'stop') {
    msg = await message.channel.send(`**[${command[1].toUpperCase()}]** ${message.author}, ha solicitado parar de reproducir música. ${extraMessage}`);
  } else if (command[0].toLowerCase() === 'remove') {
    msg = await message.channel.send(`**[${command[1].toUpperCase()}]** ${message.author}, ha solicitado eliminar una canción de la lista. ${extraMessage}`);
  }

  if (!msg) {
    return false;
  }

  await msg.react(approveEmoji || '');
  await msg.react(disapproveEmoji || '');

  const votes: string[] = [];
  let approve = 0;
  let disapprove = 0;

  const collector = msg.createReactionCollector((reaction: MessageReaction, user: User) => (
    (reaction.emoji.name === 'check_2' || reaction.emoji.name === 'x2') &&
    queue.voiceChannel.members.has(user.id) && !user.bot
  ), {
    time: 30000,
  });

  collector.on('collect', (reaction, user) => {
    if (votes.includes(user.id)) {
      return;
    }

    votes.push(user.id);
    if (reaction.emoji.name === 'check_2') {
      approve++;
    } else {
      disapprove++;
    }
  });

  if (votes.length === memberCount) {
    collector.stop();
  }

  const onFinish = async () => {
    queue.hasVote = false;

    const minVotes: number = Math.floor(memberCount / 2);

    const extraMessage = `**(${approveEmoji} ${approve} - ${disapproveEmoji} ${disapprove})**`;
    if (approve === disapprove) {
      await message.channel.send(`**[${command[1].toUpperCase()}]** ¡Ha ocurrido un empate! ${extraMessage}`);
    } else if (votes.length < minVotes) {
      await message.channel.send(`**[${command[1].toUpperCase()}]** ¡No han votado la mitad de los oyentes! ${extraMessage}`);
    } else if (disapprove > approve) {
      await message.channel.send(`**[${command[1].toUpperCase()}]** ¡La mayoría de votantes eligieron rechazar la solicitud! ${extraMessage}`);
    } else {
      await message.channel.send(`**[${command[1].toUpperCase()}]** ¡La mayoría de votantes eligieron aprobar la solicitud! ${extraMessage}`);

      if (command[0].toLowerCase() !== 'next') {
        if (command[0].toLowerCase() === 'stop') {
          queue.stopped = true;

          await sendMessage(message, 'he parado de reproducir música.', command[1]);
        } else if (command[0].toLowerCase() === 'remove') {
          const i = Number(extra.song_index);
          delete extra.song_index;

          queue.songs.splice(i, 1);

          await sendMessage(message, `la canción **${extra.song_name}** de **${extra.song_author}** ha sido eliminada de la lista de reproducción.`, command[1]);
        }
      }

      if (command[0].toLowerCase() !== 'remove') {
        if (queue.playing && queue.playingDispatcher) {
          queue.playingDispatcher.end();
          queue.playingDispatcher = null;
        }
      }

      queue.playing = false;
    }
  };

  collector.on('end', () => onFinish());
  collector.on('remove', () => onFinish());
  return true;
};

let ytVars: string[] = [];

const yvar: string | undefined = process.env.YOUTUBE;
if (yvar) {
  if (yvar.startsWith('[') && yvar.endsWith(']')) {
    ytVars = JSON.parse(yvar);
  } else {
    ytVars = [yvar];
  }
} else {
  ytVars = [];
}

let ytI = 0;

let ytClass: any = null;

export const yt = (force = false, change = false) => {
  if (ytClass == null || force) {
    if (change) {
      if (ytI >= ytVars.length) {
        ytI = 0;
      } else {
        ytI++;
      }
    }

    ytClass = new YouTube(ytVars[ytI]);
  }

  return ytClass;
};
