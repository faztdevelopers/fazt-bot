// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';
import { PackageInfo } from '../commands/general/npm';

export default class extends MessageEmbed {
  constructor(packageInfo: PackageInfo) {
    super();
    this.color = 0x0FF0022;
    this.author = {
      name: packageInfo.name,
      iconURL: 'https://i.imgur.com/ErKf5Y0.png',
      url: `https://www.npmjs.com/package/${packageInfo.name}`,
    };

    if (packageInfo.description.length) {
      this.description = packageInfo.description;
    } else if (packageInfo.unpublished) {
      this.description = 'No publicado.';
    }

    if (packageInfo.homepage && packageInfo.homepage.length) {
      this.addField('Página principal', packageInfo.homepage, false);
    }

    if (packageInfo.version.length) {
      this.addField('Versión', packageInfo.version, true);
    }

    if (packageInfo.license && packageInfo.license.length) {
      this.addField('Licencia', packageInfo.license, true);
    }

    if (packageInfo.dependencies) {
      this.addField('Dependencias', packageInfo.dependencies, true);
    }
  }
}
