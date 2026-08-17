// Tell the user when their session will not survive a relaunch.
//
// `sessionPersisted` goes false whenever the refresh token did not reach
// durable storage — for ANY reason: no native module, no keychain
// entitlement, or a store that simply refused the write. The cause does
// not change what the user needs to know, and conditioning the warning on
// the cause is how a broken store gets reclassified as an expected one.
// Three different paths can set it —
// sign-in, the 401 refresh, and the cold-start refresh — and only the
// first of them used to say anything. The other two are the ones that
// matter most: a rotated refresh token that fails to persist leaves the
// app working normally for the rest of the process and then silently
// signed out on next launch, which reads as the app losing the session
// for no reason.
//
// Watching the flag centrally means the warning cannot be forgotten by
// whichever path adds the next call to `markAuthenticated`.

import {useEffect, useRef} from 'react';

import useAuthSession, {AUTHENTICATED} from '../provider/store/authSession';
import {toast} from '../utils/toast';

export const PERSISTENCE_WARNING =
  "We couldn't save your session on this device — you'll need to sign in " +
  'again next time you open the app.';

export const useSessionPersistenceWarning = () => {
  const status = useAuthSession(s => s.status);
  const persisted = useAuthSession(s => s.sessionPersisted);
  // Warn on the TRANSITION, not on the state. Re-warning on every render
  // while the flag stays false would put a toast in front of the user on
  // every screen change for the rest of the session.
  const warned = useRef(false);

  useEffect(() => {
    if (status !== AUTHENTICATED) {
      // A new session gets a fresh chance to warn.
      warned.current = false;
      return;
    }
    if (persisted || warned.current) return;
    warned.current = true;
    toast.show(PERSISTENCE_WARNING, toast.LONG);
  }, [status, persisted]);
};

export default useSessionPersistenceWarning;
