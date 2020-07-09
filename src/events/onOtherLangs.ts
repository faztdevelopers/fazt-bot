import { Message, MessageEmbed } from 'discord.js';
import axios from 'axios';

const onOtherLangs = async (message: Message): Promise<void> => {
  const texts: any[] = (await axios.get('https://translate.googleapis.com/translate_a/single', {
    params: {
      client: 'gtx',
      sl: 'auto',
      tl: 'es',
      dt: 't',
      q: message.content,
    }
  })).data[0];

  let msg = '';
  if (texts.length) {
    const str: string[] = [];
    for (const text of texts) {
      str.push(text[0]);
    }

    msg = str.join('');
  }

  if (!msg.length) {
    return;
  }

  msg = msg.replace(/<@!\s/gi, '<@!').replace(/<#\s/gi, '<#').replace(/<@\s&\s/gi, '<@&');

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

  msg = emojiReplace(msg, 0);

  await message.channel.send(
    new MessageEmbed()
      .setDescription(msg)
      .setColor('#009688')
      .setFooter(message.author.username)
      .setTimestamp(Date.now())
  );
};

export default onOtherLangs;
