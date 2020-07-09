import Command, { CommandGroup, sendMessage } from '../command';
import { Message, Client } from 'discord.js';
import axios from 'axios';
import PackageEmbed from '../../embeds/PackageEmbed';

export interface PackageInfo {
  name: string;
  description: string;
  version: string;
  license?: string;
  homepage?: string;
  dependencies?: number;
  devDependencies?: number;
  unpublished: boolean;
}

export default class NPM implements Command {
  names: Array<string> = ['npm'];
  arguments = '(package)';
  group: CommandGroup = 'general';
  description = 'Obtén la información de un package de NPM.';

  async onCommand(message: Message, bot: Client, params: Array<string>): Promise<void> {
    try {
      if (!params[1]) {
        await sendMessage(message, 'debes ingresar el nombre de un package.', params[0]);
        return;
      }

      const packageInfo: PackageInfo = {
        name: '',
        description: '',
        version: '',
        unpublished: false,
      };

      const packageData = (await axios.get(`https://registry.npmjs.org/${params[1]}`)).data;

      packageInfo.name = packageData.name;
      if (packageData['dist-tags']) {
        packageInfo.description = packageData.description;
        packageInfo.version = packageData['dist-tags'].latest;
        packageInfo.license = packageData.license;
        packageInfo.homepage = packageData.homepage;
        packageInfo.dependencies = Object.keys(packageData.versions[packageInfo.version].dependencies || {}).length;
        packageInfo.devDependencies = Object.keys(packageData.versions[packageInfo.version].devDependencies || {}).length;
      } else if (packageData.time.unpublished) {
        const packageUnpublished = packageData.time.unpublished;

        packageInfo.unpublished = true;
        packageInfo.version = packageUnpublished.tags.latest;
      } else {
        throw new Error('The package requested data is not valid.');
      }

      await message.channel.send(new PackageEmbed(packageInfo));
    } catch (error) {
      await sendMessage(message, `el package **${params[1]}** no existe.`, params[0]);
    }
  }
}
