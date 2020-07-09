import { Message } from 'discord.js';
import axios from 'axios';

const onMention = async (message: Message): Promise<void> => {
  if (!message.guild) {
    return;
  }

  const index: number = Math.floor(Math.random() * 50);

  let quote = '';
  if (index <= 25) {
    const data = await axios.get('https://opinionated-quotes-api.gigalixirapp.com/v1/quotes?rand=t&tags=programming');

    const quotes = data.data.quotes;
    if (quotes && quotes.length) {
      quote = quotes[0].quote;
    }
  } else {
    quote = (await axios.get('http://quotes.stormconsultancy.co.uk/random.json')).data.quote;
  }

  if (quote && quote.length) {
    const texts: any[] = (await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: 'auto',
        tl: 'es',
        dt: 't',
        q: quote,
      }
    })).data[0];

    if (texts.length) {
      const str: string[] = [];
      for (const text of texts) {
        str.push(text[0]);
      }

      quote = str.join('');
    }

    await message.channel.send(quote);
    return;
  }
};

export default onMention;
