import {MMKV} from 'react-native-mmkv';

export const mmkvStorage = new MMKV({
  id: '_store',
});

export const ZustandStorage = {
  setItem: (name, value) => {
    return mmkvStorage.set(name, value);
  },
  getItem: name => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  getAllKeys: () => {
    return mmkvStorage.getAllKeys();
  },
  removeItem: name => {
    return mmkvStorage.delete(name);
  },
  clear: () => {
    return mmkvStorage.clearAll();
  },
};
