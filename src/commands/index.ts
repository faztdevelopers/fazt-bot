import Command from './command';
import * as nPath from 'path';
import * as fs from 'fs';

const Commands: Array<Command> = [];
const paths: string[] = [
  'developers',
  'general',
  'moderation',
  'music',
];

if (paths.length) {
  for (const path of paths) {
    const files = fs.readdirSync(nPath.resolve(__dirname, path));
    if (files.length) {
      for (const fileName of files) {
        if (!fileName.endsWith('.ts') && !fileName.endsWith('.js')) {
          continue;
        }

        const Command = require(`./${path}/${fileName}`);
        const command = new Command();
        Commands.push(command);
      }
    }
  }
}

export default Commands;
