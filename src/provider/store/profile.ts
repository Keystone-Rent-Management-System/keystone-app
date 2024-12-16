import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {Profile, ProfileKey} from '../../types/auth.ts';
import {ZustandStorage} from './MMKV';

interface IProfileStore {
  profile: Profile | null;
  saveProfile: (profile: Profile) => void;
  clearProfile: () => void;
  updateProfile: (ProfileKey: ProfileKey, value: Profile[ProfileKey]) => void;
}

export const useProfileStore = create(
  persist<IProfileStore>(
    set => ({
      profile: null,
      saveProfile: profile => set({profile}),
      clearProfile: () => set({profile: null}),
      updateProfile: (key, value) =>
        set(state => ({
          profile: {
            ...state.profile,
            [key]: value,
          } as Profile,
        })),
    }),
    {
      name: '_state_profile', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => ZustandStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
