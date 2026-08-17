import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {ZustandStorage} from './MMKV';

// Debug-build data-source override — the sibling of devRole.
//
// The app talks to the real Keystone gateway by default, in every build.
// A debug build can be flipped onto the bundled fixtures (Account →
// "Data source") so the redesigned screens can be demoed off-network or
// against endpoints the BE has not shipped yet. Release builds always
// resolve to 'live'; the __DEV__ gate lives in the resolver below so no
// caller has to remember it.
//
// This replaces the old `USE_MOBILE_MOCKS = __DEV__` constant, which
// forced EVERY debug build onto fixtures — meaning the app could never
// be exercised against the backend without a source edit + rebuild.
//
// Note this is the *global* override only. The per-endpoint 404/501
// fallback in each service is independent and stays on in both modes:
// a screen whose endpoint BE hasn't built yet still renders its fixture
// rather than an error, and logs `[mock] serving fixture for "…"`.

export type DataSource = 'live' | 'mock';

interface IDataSourceStore {
  source: DataSource;
  setSource: (source: DataSource) => void;
}

export const useDataSourceStore = create(
  persist<IDataSourceStore>(
    set => ({
      // DEBUG BUILDS DEFAULT TO FIXTURES.
      //
      // Release is unaffected: `resolveDataSource` below hard-returns
      // 'live' when `__DEV__` is false, so no shipped build can reach
      // fixture data regardless of what is persisted here.
      //
      // This was 'live', which meant a debug build opened on empty
      // screens — every tenant endpoint either 401s without a session or
      // is not built yet — and the demo journey the fixtures exist for
      // was unreachable until someone found a toggle three taps deep in
      // Account. Defaulting to the thing the build is FOR.
      //
      // To exercise the real backend, flip Account → Data source → Live.
      // …EXCEPT under test. Making fixtures the ambient default put the
      // whole suite into demo mode, so `can('rentPayments')` returned
      // true and every capability-honesty test silently began asserting
      // the DEMO product instead of the real one. Four went red; the
      // dangerous version is the ones that would have stayed green.
      // Tests assert the shipped behaviour unless they opt into demo
      // mode explicitly, as demoContainment.test.js does.
      source: process.env.JEST_WORKER_ID ? 'live' : 'mock',
      setSource: source => set({source}),
    }),
    {
      name: '_state_data_source',
      storage: createJSONStorage(() => ZustandStorage),
    },
  ),
);

/** The effective source for this build — release is always 'live'. */
export const resolveDataSource = (): DataSource =>
  __DEV__ ? useDataSourceStore.getState().source : 'live';
