import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {IAgreement} from '../../types/agreement.ts';
import {ZustandStorage} from './MMKV';

interface IAgreementStore {
  activeAgreement: IAgreement | null;
  inactiveAgreement: IAgreement | null;
  saveAgreement: (agreement: IAgreement) => void;
  saveInactiveAgreement: (inactiveAgreement: IAgreement | null) => void;
  clearAgreement: () => void;
}

export const useActiveAgreement = create(
  persist<IAgreementStore>(
    set => ({
      activeAgreement: null,
      inactiveAgreement: null,
      saveAgreement: agreement => set({activeAgreement: agreement}),
      saveInactiveAgreement: agreement => set({inactiveAgreement: agreement}),
      clearAgreement: () => set({activeAgreement: null}),
    }),
    {
      name: '_state_active_agreement', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => ZustandStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
