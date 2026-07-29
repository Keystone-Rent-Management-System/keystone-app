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
      // Debug builds open on the tenant side; 'auto' defers to the real
      // roles on the signed-in profile.
      role: 'tenant',
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
