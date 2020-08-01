// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { MessageEmbed } from 'discord.js';
import { TagsPage } from '../utils/tags';

export default class TagsEmbed extends MessageEmbed {
  constructor(tagsPage: TagsPage) {
    super();

    this.color = 0xff0022;
    this.title = 'Tags';

    const { tags, page, totalPages } = tagsPage;

    console.log(tags);

    for (const tag of tags) {
      const content =
        tag.content.length > 1024 ? tag.content.slice(0, 1020) : tag.content;

      this.addField(tag.title, content, false);
    }

    this.footer = { text: `Página ${page} de ${totalPages} | Fazt Tech` };
  }
}
