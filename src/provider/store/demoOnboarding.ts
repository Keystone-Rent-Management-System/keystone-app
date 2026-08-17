import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {ZustandStorage} from './MMKV';

// Which VILLA_5_TENANTS state the demo is sitting in.
//
// The onboarding journey has ten states and most of them are reached by
// waiting on a landlord or a screening provider, so there is no way to
// walk them from the UI. This store lets a reviewer jump to any state
// from Account → "Onboarding demo".
//
// __DEV__-gated in the same way as devRole/devDataSource: `resolve()`
// returns null in a release build, so no release can enter the demo
// journey, and the screens fall back to their real (unavailable) state.

export type OnboardingDemoState =
  | 'INVITE_RECEIVED'
  | 'ABOUT_YOU_REQUIRED'
  | 'IDENTITY_REQUIRED'
  | 'SCREENING_CONSENT_REQUIRED'
  | 'SCREENING_IN_PROGRESS'
  | 'SCREENING_NEEDS_INFORMATION'
  | 'LANDLORD_REVIEW'
  | 'AGREEMENT_READY'
  | 'AGREEMENT_SIGNATURE_PENDING'
  | 'ONBOARDED'
  | 'ADVERSE_ACTION';

interface IDemoOnboardingStore {
  state: OnboardingDemoState;
  setState: (state: OnboardingDemoState) => void;
}

export const useDemoOnboardingStore = create(
  persist<IDemoOnboardingStore>(
    set => ({
      // Default ONBOARDED so an ordinary debug launch still lands on the
      // tenant tabs; a reviewer opts in to the journey deliberately.
      state: 'ONBOARDED',
      setState: state => set({state}),
    }),
    {
      name: '_state_demo_onboarding',
      storage: createJSONStorage(() => ZustandStorage),
    },
  ),
);

/** The demo state for this build — always null in release. */
export const resolveDemoOnboarding = (): OnboardingDemoState | null =>
  __DEV__ ? useDemoOnboardingStore.getState().state : null;

// The journey as an applicant actually walks it.
//
// The jumper alone lets you inspect each screen, but inspecting ten
// screens is not the same as living through a sequence — the waiting, the
// order, the moment a decision lands. `advanceDemo()` moves one step
// along the approval path so the flow can be walked the way a tenant
// would meet it.
const APPROVAL_PATH: OnboardingDemoState[] = [
  'INVITE_RECEIVED',
  'ABOUT_YOU_REQUIRED',
  'IDENTITY_REQUIRED',
  'SCREENING_CONSENT_REQUIRED',
  'SCREENING_IN_PROGRESS',
  'LANDLORD_REVIEW',
  'AGREEMENT_READY',
  'AGREEMENT_SIGNATURE_PENDING',
  'ONBOARDED',
];

/** Next state on the approval path; stays put at the end. */
export const advanceDemo = (): OnboardingDemoState => {
  const {state, setState} = useDemoOnboardingStore.getState();
  const i = APPROVAL_PATH.indexOf(state);
  // Off-path states (ADVERSE_ACTION, SCREENING_NEEDS_INFORMATION) are
  // terminal for this purpose — walking "forward" from a decline would
  // imply a decline is a step on the way to approval, which is exactly
  // the wrong idea to build into a demo.
  if (i === -1 || i === APPROVAL_PATH.length - 1) return state;
  const next = APPROVAL_PATH[i + 1];
  setState(next);
  return next;
};

/** Take the decline branch instead. */
export const declineDemo = () => {
  useDemoOnboardingStore.getState().setState('ADVERSE_ACTION');
};

/** Ask for more information instead. */
export const needsInfoDemo = () => {
  useDemoOnboardingStore.getState().setState('SCREENING_NEEDS_INFORMATION');
};

/**
 * Start the journey over.
 *
 * Also wipes the identity material, so a second walkthrough does not
 * start holding the SSN and licence photo from the first.
 */
export const resetDemoJourney = async (): Promise<boolean> => {
  // eslint-disable-next-line global-require
  const {clearDemoIdentity} = require('./demoIdentity');
  // AWAITED. Dropping this promise meant a restart could begin while the
  // previous walkthrough's licence photo was still on disk — and nothing
  // would ever have reported the failure.
  const cleared = await clearDemoIdentity();
  useDemoOnboardingStore.getState().setState('INVITE_RECEIVED');
  return cleared;
};

export const demoJourneyPath = APPROVAL_PATH;
// Console control of this store lives in devConsoleBridge.ts.
