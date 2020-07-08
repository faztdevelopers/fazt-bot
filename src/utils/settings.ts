import * as Settings from '../database/models/setting';

export const getAll = async (): Promise<Settings.Setting[]> => await Settings.model.find({});

export const getByName = async (name: string): Promise<Settings.Setting | null> => (
  (await getAll()).find((setting) => setting.name === name) || null
);

export const hasByName = async (name: string): Promise<boolean> => (await getByName(name)) != null;

export const create = async (name: string, value: string): Promise<Settings.Setting | null> => {
  try {
    if (await hasByName(name)) {
      return null;
    }

    const setting: Settings.Setting = new Settings.model({ name, value });
    await setting.save();

    return (await hasByName(name)) ? setting : null;
  } catch (error) {
    await Promise.reject(error);
    return null;
  }
};

export const update = async (name: string, value: string): Promise<Settings.Setting | null> => {
  try {
    const setting: Settings.Setting | null = await getByName(name);
    if (!setting) {
      return null;
    }

    setting.value = value;
    await setting.save();

    return setting;
  } catch (error) {
    await Promise.reject(error);
    return null;
  }
};
