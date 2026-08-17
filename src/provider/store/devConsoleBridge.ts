// The __keystoneDev console bridge, in one place.
//
// The debug stores' UI controls live in Account (inside the tabs) and on
// Welcome — but a walkthrough driven over iPhone Mirroring cannot reach
// the tab bar (the mirror's own edge controls swallow taps there), so
// the stores also answer to the React Native DevTools console / CDP:
//
//   __keystoneDev.setRole('tenant' | 'landlord' | 'auto')
//   __keystoneDev.setSource('mock' | 'live')
//   __keystoneDev.setDemo('INVITE_RECEIVED' | … )   — jump journey state
//   __keystoneDev.advanceDemo()                     — next approval step
//   __keystoneDev.resetDemoJourney()                — restart + wipe identity
//
// Registered from Main.jsx so it exists from app start. Requires are
// call-time: registering the bridge must not pull any store into the
// startup path that was not already on it — demoOnboarding in particular
// loads only when an onboarding screen needs it. __DEV__-gated like the
// stores themselves; release builds get an empty module.

import type {DevRole} from './devRole';
import type {DataSource} from './devDataSource';
import type {OnboardingDemoState} from './demoOnboarding';

if (__DEV__) {
  (global as any).__keystoneDev = {
    setRole: (role: DevRole) =>
      require('./devRole').useDevRoleStore.getState().setRole(role),
    setSource: (source: DataSource) =>
      require('./devDataSource').useDataSourceStore.getState().setSource(source),
    setDemo: (state: OnboardingDemoState) =>
      require('./demoOnboarding').useDemoOnboardingStore.getState().setState(state),
    advanceDemo: () => require('./demoOnboarding').advanceDemo(),
    resetDemoJourney: () => require('./demoOnboarding').resetDemoJourney(),
  };
}

export {};
