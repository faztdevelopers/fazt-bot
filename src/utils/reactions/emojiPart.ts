// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

export interface EmojiPart {
  name: string;
  id: string;
}

function getEmojiPart(emoji: string): EmojiPart {
  let firstI = -1;
  let secondI = -1;
  let thirdI = -1;

  if (emoji.indexOf('<a:') >= 0) {
    firstI = emoji.indexOf('<a:') + 3;
    secondI = emoji.indexOf(':', firstI);
    thirdI = emoji.indexOf('>', secondI);
  } else if (emoji.indexOf('<:') >= 0) {
    firstI = emoji.indexOf('<:') + 2;
    secondI = emoji.indexOf(':', firstI);
    thirdI = emoji.indexOf('>', secondI);
  }

  return {
    name: emoji.slice(firstI, secondI).trim(),
    id: emoji.slice(secondI + 1, thirdI).trim(),
  };
}

export default getEmojiPart;
