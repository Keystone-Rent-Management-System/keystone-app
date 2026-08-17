// Resolve the session once, at launch, before anything authenticated
// mounts.
//
// The app previously had no such moment. It read
// `auth.access_token` straight out of the store during the first render
// and branched on it, which on a cold start is always empty — so the
// signed-out tree mounted, its screens fired queries that 401'd, and the
// refresh interceptor then repaired the session underneath a navigator
// that had already committed to the wrong branch. What the user saw
// depended on how fast the network was.
//
// This runs the refresh FIRST and reports one of two outcomes:
//
//   refresh succeeds        → authenticated
//   no token / it fails     → signedOut
//
// Both are conclusions. `bootstrapping` is the absence of one, and the
// navigation gate must render neither branch while it holds.

import {useEffect} from 'react';

import useAuthSession, {
  BOOTSTRAPPING,
  endSession,
} from '../provider/store/authSession';
import {
  loadRefreshToken,
  probeSecureStore,
} from '../provider/store/secureAuth';
import {ensureFreshSession} from '../services/AxiosServices';

export const useAuthBootstrap = () => {
  const status = useAuthSession(s => s.status);

  useEffect(() => {
    // Only ever runs for the launch state. There is no path back to
    // `bootstrapping`, so this cannot re-enter after a sign-out.
    if (useAuthSession.getState().status !== BOOTSTRAPPING) return undefined;

    let cancelled = false;

    const resolve = async () => {
      try {
        // DIAGNOSTIC ONLY — it must not decide anything. A real
        // write/read/delete against the secure store, run once at launch
        // so that a broken store announces itself with its native error
        // instead of presenting as an unexplained memory-only session.
        // This is what would have named the missing keychain entitlement
        // (OSStatus -34018) immediately rather than after a device
        // bisect. Whether the user is warned is decided by the actual
        // token write, not by this.
        probeSecureStore();

        const stored = await loadRefreshToken();
        if (!stored) {
          // No stored session. This is the expected cold-start outcome
          // whenever the secure store is unavailable, and it is a real
          // answer — not a failure to be retried.
          if (!cancelled) useAuthSession.getState().markSignedOut();
          return;
        }
        // Marks `authenticated` on success.
        await ensureFreshSession();
      } catch (err) {
        // A refresh token that will not exchange is a dead session. Tear
        // it down rather than leaving a token on disk that every
        // subsequent request will retry and fail on.
        if (!cancelled) {
          await endSession().catch(() => {
            // `endSession` has already moved the gate to `signedOut` and
            // flagged the failed wipe; there is nothing further to do
            // during bootstrap.
          });
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
};

export default useAuthBootstrap;
