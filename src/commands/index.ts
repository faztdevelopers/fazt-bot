import Command from './command';
import * as nPath from 'path';
import * as fs from 'fs';

const Commands: Command[] = [];
const paths: string[] = [
  'general',
  'moderation',
  'music',
];

if (paths.length) {
  for (let path of paths) {
    const files = fs.readdirSync(nPath.resolve(__dirname, path));
    if (files.length) {
      for (let fileName of files) {
        if (!fileName.endsWith('.ts') && !fileName.endsWith('.js')) {
          continue;
        }

        const command = require(`./${path}/${fileName}`).default;
        if (command && command.format && typeof command.execute === 'function') {
          Commands.push(command);
        }
      }
    }
  }
}

export default Commands;
