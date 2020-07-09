import Command from './command';
import * as nPath from 'path';
import * as fs from 'fs';

const Commands: Array<Command> = [];

const root: string = nPath.resolve(__dirname, './');
const paths: string[] = fs.readdirSync(root);

if (paths.length) {
  for (let path of paths) {
    const pathRute: string = nPath.resolve(root, path);

    const pathInfo: fs.Stats = fs.statSync(pathRute);
    if (pathInfo.isDirectory()) {
      const files: string[] = fs.readdirSync(pathRute);
      if (files.length) {
        for (let file of files) {
          if (!file.endsWith('.ts') && !file.endsWith('.js')) {
            continue;
          }

          const CommandClass = require(`./${path}/${file}`).default;
          if (CommandClass) {
            Commands.push(new CommandClass());
          }
        }
      }
    }
  }
}

export default Commands;
