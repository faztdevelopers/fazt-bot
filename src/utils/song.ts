// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import { User } from 'discord.js';
import { bot } from '..';

export const filterTitle = (title: string): string => (
  title
    .replace(/&#39;/gi, '\'')
    .replace(/&amp;/gi, '&')
);

export const filterDuration = (duration: number): string => {
  let str = '';

  const hours: number = Math.floor(duration / 3600);
  if (hours > 0) {
    str += `${`0${hours}`.substr(-2)}:`;
  }

  const minutes: number = Math.floor(duration % 3600 / 60);
  if (minutes > 0) {
    str += `${`0${minutes}`.substr(-2)}:`;
  } else {
    str += '00:';
  }

  return `${str}${`0${Math.floor(duration % 60)}`.substr(-2)}`;
};

class Song {
  constructor(
    private id: string,
    private title: string,
    private thumbnail: string,
    private description: string,
    private by: string,
    private duration: number,
    private addedBy: string,
  ) { }

  getURL(): string {
    return `https://www.youtube.com/watch?v=${this.id}`;
  }

  getTitle(): string {
    return filterTitle(this.title);
  }

  getThumbnail(): string {
    return this.thumbnail;
  }

  getDescription(): string {
    return this.description.substr(0, 200) + (this.description.length > 200 ? '...' : '');
  }

  getAuthor(): string {
    return this.by;
  }

  getDurationTime(): number {
    return this.duration;
  }

  getDuration(): string {
    return filterDuration(this.getDurationTime());
  }

  getUser(): User | null {
    return bot.users.cache.get(this.addedBy) || null;
  }
}

export default Song;
