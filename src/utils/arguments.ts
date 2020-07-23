// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

/**
 * Get the arguments of a string. For example:
 * --type=channel --message=Test
 * @function
 * @param { string } message
 * @returns { { [name: string]: string } }
 */
function getArguments(message: string): { [name: string]: string } {
  const keys: { [name: string]: string } = {};

  if (message.length) {
    const params: Array<string> = message.split('=');
    if (params.length) {
      let i = 0;
      for (const param of params) {
        const lastParam = params[i - 1];
        let currentParam = '';

        if (!lastParam) {
          currentParam = param;
        } else {
          const values: Array<string> = param.split(' ');
          currentParam = values[values.length - 1];
        }

        const nextParam = params[i + 1];
        if (nextParam) {
          const values: Array<string> = nextParam.split(' ');
          keys[currentParam] = values.slice(0, values.length - 1).join(' ');
        } else {
          const values: Array<string> = lastParam.split(' ');
          const key = values[values.length - 1];

          keys[key] = `${keys[key].length > 0 ? `${keys[key]} ` : ''}${currentParam}`;
        }

        i++;
      }
    }
  }

  return keys;
}

export default getArguments;
