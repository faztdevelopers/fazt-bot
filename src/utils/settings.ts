// Copyright 2020 Fazt Community ~ All rights reserved. MIT license.

import * as Settings from '../database/models/setting';

export const getByName = async (name: string): Promise<Settings.Setting | null> => await Settings.model.findOne({ name });

export const hasByName = async (name: string): Promise<boolean> => (await getByName(name)) != null;

export const create = async (name: string, value: string): Promise<Settings.Setting | null> => {
  if (await hasByName(name)) {
    return null;
  }

  const setting: Settings.Setting = new Settings.model({ name, value });
  await setting.save();

  return (await hasByName(name)) ? setting : null;
};

export const update = async (name: string, value: string): Promise<Settings.Setting | null> => {
  const setting: Settings.Setting | null = await getByName(name);
  if (!setting) {
    return null;
  }

  setting.value = value;
  await setting.save();

  return setting;
};

export const remove = async (name: string): Promise<boolean> => {
  const setting: Settings.Setting | null = await getByName(name); 
  if (!setting) {
    return false;
  }

  await Settings.model.findByIdAndDelete(setting._id);
  return await hasByName(name);
};
