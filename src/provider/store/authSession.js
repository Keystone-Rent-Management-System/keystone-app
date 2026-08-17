// The authoritative answer to "is there a session?".
//
// Before this, the answer was derived ad hoc from
// `useGlobals.state.auth.access_token` at each call site. A falsy token
// meant two completely different things — "we have not looked yet" and
// "we looked and there is nothing" — and every consumer collapsed them
// into the same branch. So a cold start rendered the signed-out front
// door for the duration of the refresh, and the protected navigator
// mounted (firing authenticated queries) the instant a token appeared,
// whether or not the session behind it was still good.
//
// Three states, and the difference between the first two is the whole
// point:
//
//   bootstrapping   We have not finished asking. Nothing authenticated
//                   may mount and no authenticated query may run. This
//                   is the launch state.
//   authenticated   A refresh succeeded (or a sign-in just did). There
//                   is a live access token in memory.
//   signedOut       There is no session: no stored refresh token, a
//                   refresh that failed, or an explicit sign-out.
//
// Transitions are one-way per launch except through sign-in/sign-out —
// there is no path back to `bootstrapping`, because "we have not looked
// yet" can only be true once.

import {create} from 'zustand';
import {setAccessToken, clearSession} from './secureAuth';
import useGlobals from './useGlobals';

export const BOOTSTRAPPING = 'bootstrapping';
export const AUTHENTICATED = 'authenticated';
export const SIGNED_OUT = 'signedOut';

const useAuthSession = create(set => ({
  status: BOOTSTRAPPING,

  // Set when the secure store refused to delete on sign-out. The session
  // is unusable in this process either way, but the refresh token may
  // still be on disk — which is not a "signed out" we may present as
  // finished without saying so.
  secureWipeFailed: false,

  // False when the refresh token did not reach durable storage, for ANY
  // reason. The session works for as long as the process lives and then
  // vanishes, which is not what "signed in" implies.
  //
  // Deliberately NOT conditioned on why. An earlier version excused the
  // "no secure store at all" case as a known build configuration; that
  // excuse would have covered a store broken by a missing keychain
  // entitlement too, since an unentitled Keychain and an absent one are
  // indistinguishable from up here.
  //
  // `persistSession` returning false was originally discarded by both
  // callers, so a Keychain that rejected every write produced a session
  // indistinguishable from a durable one right up until relaunch.
  sessionPersisted: true,

  markAuthenticated: ({persisted = true} = {}) =>
    set({
      status: AUTHENTICATED,
      secureWipeFailed: false,
      sessionPersisted: persisted,
    }),

  markSignedOut: (secureWipeFailed = false) =>
    set({status: SIGNED_OUT, secureWipeFailed}),
}));

/**
 * End the session.
 *
 * Memory is cleared FIRST and synchronously: whatever the secure store
 * does next, this process must immediately lose the ability to
 * authenticate. The status flips in the same tick so the navigation gate
 * unmounts the protected tree rather than leaving it up while a native
 * call is in flight.
 *
 * The returned promise settles only after the secure-store deletion has
 * settled. Callers must await it before telling the user they are signed
 * out — a rejected or slow Keychain delete means the refresh token may
 * still be on disk, and "Signed out" would be a claim we cannot make.
 *
 * Rejects if the deletion failed, after having done everything else.
 */
export const endSession = async () => {
  setAccessToken(null);
  // Clear the zustand mirror in the same tick. It is not authoritative,
  // but it must not CONTRADICT the gate: a teardown that moved the status
  // to `signedOut` and left `state.auth.access_token` populated gave the
  // few consumers still reading the mirror the opposite answer, so a dead
  // session still looked live to them.
  useGlobals.getState().resetState();
  useAuthSession.getState().markSignedOut();
  try {
    await clearSession();
  } catch (err) {
    useAuthSession.getState().markSignedOut(true);
    throw err;
  }
};

export default useAuthSession;
