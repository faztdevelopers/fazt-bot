// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import * as Tags from '../database/models/tag';

export const getAll = async (): Promise<Tags.Tag[]> =>
  await Tags.model.find({});

export interface TagsPage {
  tags: Tags.Tag[];
  page: number;
  totalPages: number;
}

export const getPage = async (page: number): Promise<TagsPage> => {
  const perPage = 5;
  const start = (page - 1) * perPage;

  const count = await Tags.model.find({}).estimatedDocumentCount();
  const tags = await Tags.model.find({}).skip(start).limit(perPage);
  const totalPages = Math.ceil(count / perPage);

  return {
    tags,
    page,
    totalPages,
  };
};

export const getByTitle = async (title: string): Promise<Tags.Tag | null> =>
  await Tags.model.findOne({ title });

export const hasByTitle = async (title: string): Promise<boolean> =>
  (await getByTitle(title)) != null;

export const create = async (
  title: string,
  content: string
): Promise<Tags.Tag | null> => {
  try {
    if (await hasByTitle(title)) {
      return null;
    }

    const tag: Tags.Tag = new Tags.model({ title, content });
    await tag.save();

    return tag;
  } catch (error) {
    await Promise.reject(error);
    return null;
  }
};

export const update = async (
  title: string,
  content: string
): Promise<Tags.Tag | null> => {
  try {
    const tag: Tags.Tag | null = await getByTitle(title);
    if (!tag) {
      return null;
    }

    tag.content = content;
    await tag.save();

    return tag;
  } catch (error) {
    await Promise.reject(error);
    return null;
  }
};

export const deleteByTitle = async (title: string): Promise<boolean> => {
  try {
    await Tags.model.deleteOne({ title });
    return true;
  } catch (error) {
    return false;
  }
};
