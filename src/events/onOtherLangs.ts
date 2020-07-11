// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { Message } from 'discord.js';
import axios from 'axios';
import OnOthersLangsEmbed from '../embeds/onOthersLangsEmbed';

const translate = async (message: string, lang: 'es' | 'en'): Promise<string> => {
  const texts: string[] | undefined = (await axios.get('https://translate.googleapis.com/translate_a/single', {
    params: {
      client: 'gtx',
      sl: 'auto',
      tl: lang,
      dt: 't',
      q: message,
    }
  })).data[0];

  let msg = '';
  if (texts?.length) {
    const str: string[] = [];
    for (const text of texts) {
      str.push(text[0]);
    }

    msg = str.join('');
  }

  return msg;
};

const replaceMessage = (message: string): string => {
  message = message
    .replace(/<@!\s/gi, '<@!')
    .replace(/<#\s/gi, '<#')
    .replace(/<@\s&\s/gi, '<@&')
    .replace(/<@\s/gi, '<@');

  const emojiReplace = (msg: string, lastIndex: number): string => {
    let firstI = -1;
    let secondI = -1;
    let thirdI = -1;
    let isAnimated = false;

    if (msg.indexOf('<a:', lastIndex) >= 0) {
      firstI = msg.indexOf('<a:', lastIndex) + 3;
      secondI = msg.indexOf(':', firstI);
      thirdI = msg.indexOf('>', secondI);
      isAnimated = true;
    } else if (msg.indexOf('<:', lastIndex) >= 0) {
      firstI = msg.indexOf('<:', lastIndex) + 2;
      secondI = msg.indexOf(':', firstI);
      thirdI = msg.indexOf('>', secondI);
    }

    if (firstI >= 0 && secondI >= 0 && thirdI >= 0) {
      const emojiName: string = msg.slice(firstI, secondI).trim();
      const emojiID: string = msg.slice(secondI + 1, thirdI).trim();
      const full: string = msg.slice(isAnimated ? firstI - 3 : firstI - 2, thirdI + 1);

      if (full.includes(' ')) {
        msg = msg.replace(full, `<${isAnimated ? 'a' : ''}:${emojiName}:${emojiID}>`);

        if ((msg.includes('<a:') || msg.includes('<:')) && msg.includes(' ')) {
          return emojiReplace(msg, thirdI);
        }
      }
    }

    return msg;
  };

  return emojiReplace(message, 0);
};

const onOtherLangs = async (message: Message): Promise<void> => {
  let msg = await translate(message.content, 'es');
  if (!msg.length) {
    return;
  }

  msg = replaceMessage(msg);
  if (msg === message.content) {
    msg = await translate(message.content, 'en');
  }

  await message.channel.send(new OnOthersLangsEmbed(msg, message.author.username));
};

export default onOtherLangs;
