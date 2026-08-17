import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {ZustandStorage} from './MMKV';

// Debug-build role override. Keystone ships two very different product
// surfaces (tenant rent center / landlord command center) behind one
// login, so a debug build needs to reach both without a real token for
// each role. This replaces the old DEV_FORCE_LANDLORD / DEV_FORCE_TENANT
// constants — those required an edit + rebuild to flip; this persists
// and flips live from Account → Preview as.
//
// Every consumer reads this through `useDevRole`, which is hard-gated on
// __DEV__, so release builds always fall through to the real profile
// roles and this store is never consulted.

export type DevRole = 'auto' | 'tenant' | 'landlord';

interface IDevRoleStore {
  role: DevRole;
  setRole: (role: DevRole) => void;
}

export const useDevRoleStore = create(
  persist<IDevRoleStore>(
    set => ({
      // DEFAULT IS 'auto' — the real path — and preview is opt-in.
      //
      // This defaulted to 'tenant', which made `forceRole` true on every
      // fresh debug install. `navigation/Main.jsx` then registered
      // `bottom-nav` and the private screens with NO session, so a debug
      // build never showed the signed-out front door, never exercised the
      // navigation gate, and did not evict the user when a session died.
      // The bypass was doing real work that nobody had opted into.
      //
      // It was also self-trapping: "Preview as" lives in Account, inside
      // the tabs, so the only way to leave the bypass was through a
      // screen the bypass had put you in. Welcome now carries a
      // __DEV__-only control so preview can be entered from outside a
      // session — see screens/authentication/Welcome.jsx.
      role: 'auto',
      setRole: role => set({role}),
    }),
    {
      name: '_state_dev_role',
      storage: createJSONStorage(() => ZustandStorage),
    },
  ),
);

/**
 * Resolve the effective role for the current build.
 * `realTenant` / `realLandlord` come from the signed-in profile; in a
 * release build they are returned untouched.
 */
export const useDevRole = (realTenant: boolean, realLandlord: boolean) => {
  const role = useDevRoleStore(s => s.role);
  if (!__DEV__ || role === 'auto') {
    return {isTenant: realTenant, isLandlord: realLandlord};
  }
  return {isTenant: role === 'tenant', isLandlord: role === 'landlord'};
};
