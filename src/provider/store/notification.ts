import {createJSONStorage, persist} from 'zustand/middleware';
import {create} from 'zustand';
import {DeviceToken} from '../../types/notification.ts';
import {ZustandStorage} from './MMKV';

interface INotificationStore {
  deviceToken: DeviceToken | null;
  saveDeviceToken: (token: DeviceToken) => void;
  removeDeviceToken: () => void;
}

export const useNotificationStore = create(
  persist<INotificationStore>(
    set => ({
      deviceToken: null,
      saveDeviceToken: token => set({deviceToken: token}),
      removeDeviceToken: () => set({deviceToken: null}),
    }),
    {
      name: '_state_notifications', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => ZustandStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
