// Keep the handset registered for push for the life of an authenticated
// session — every authenticated session, however it began.
//
// Registration used to be started from `useLogin.onSuccess`, which ties it
// to the act of typing a password. A returning user whose session is
// restored from the Keychain never runs that path, so precisely the users
// whose sessions persist were the ones who never registered. Same for a
// session recovered by the cold-start refresh.
//
// Driving it from the gate's status covers all three entry points with
// one rule, and gives cancellation an obvious home: when the session ends,
// the subscription and any scheduled retry go with it.

import {useEffect} from 'react';

import useAuthSession, {AUTHENTICATED} from '../provider/store/authSession';
import NotificationService from '../services/Notification';
import {useDataSourceStore} from '../provider/store/devDataSource';

export const useSessionPushRegistration = () => {
  const status = useAuthSession(s => s.status);
  // THE DATA SOURCE IS PART OF THE TRIGGER, not just the session.
  //
  // In Fixtures mode the registration write is blocked locally, so the
  // handset is NOT registered with the gateway. Switching to Live changes
  // neither the auth status nor the APNs token, so without this
  // dependency nothing would ever re-run and the handset would stay
  // unregistered for the rest of the session — quietly, and in exactly
  // the situation where someone is about to test against the real
  // backend. `__DEV__`-only in practice: release always resolves 'live'.
  const source = useDataSourceStore(s => s.source);

  useEffect(() => {
    if (status !== AUTHENTICATED) return undefined;

    // Registers now if APNs has already issued a token, otherwise when it
    // does — and keeps watching, so a mid-session token rotation
    // re-registers rather than being missed.
    NotificationService.registerWhenReady();

    return () => {
      // Ending the session abandons the store subscription, any scheduled
      // retry, and the RESULT of a request already in flight.
      NotificationService.cancelPendingRegistration();
    };
  }, [status, source]);
};

export default useSessionPushRegistration;
