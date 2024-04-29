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
  removeItem: name => {
    return mmkvStorage.delete(name);
  },
};
