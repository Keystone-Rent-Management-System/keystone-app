import {useMutation} from '@tanstack/react-query';
import {Keyboard} from 'react-native';

import {useActiveAgreement} from '../provider/store';
import {useProfileStore} from '../provider/store/profile';
import useGlobals from '../provider/store/useGlobals';
import useAuthSession from '../provider/store/authSession';
import {persistSession} from '../provider/store/secureAuth';
import AgreementServices from '../services/AgreementServices';
import AuthServices from '../services/AuthServices';
import {
  authFailureDetail,
  describeAuthFailure,
} from '../utils/authError';
import {DEFAULT_AGREEMENT} from '../constants/agreement';
import {IAgreement} from '../types/agreement';
import {toast} from '../utils/toast';

export const useLogin = () => {
  const {updateAuth} = useGlobals(data => data);
  const markAuthenticated = useAuthSession(s => s.markAuthenticated);
  const {saveProfile} = useProfileStore();
  const {saveAgreement, saveInactiveAgreement} = useActiveAgreement();

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: async res => {
      const {userProfile, activeAgreement, inactiveAgreement, ...rest} = res;

      // Make the session durable BEFORE anything treats the user as
      // signed in. `updateAuth` is only an in-memory mirror; if the
      // refresh token never reaches the secure store, the sign-in works
      // right up until the app is next launched.
      const persisted = await persistSession(rest);
      updateAuth(rest);
      // Move the gate. The navigation gate is the sole authority on
      // whether a session exists, so a successful sign-in has to say so
      // explicitly rather than leaving the navigator to infer it from a
      // token appearing in the store.
      // A device that HAS a Keychain and refused the write gives the user
      // a session that silently evaporates on relaunch. The flag is set
      // here; the WARNING is not issued here. `useSessionPersistenceWarning`
      // watches the flag centrally, so the refresh paths — which can fail
      // to persist a rotated token just as easily, and used to say nothing
      // at all — are covered by the same code.
      markAuthenticated({persisted});
      saveProfile(userProfile);
      saveAgreement(activeAgreement);
      saveInactiveAgreement(inactiveAgreement as IAgreement);

      // NO push registration here. It is driven by AUTHENTICATED status
      // (hooks/useSessionPushRegistration), because a returning user
      // restored from the Keychain never runs this path — so tying
      // registration to the login screen meant the users whose sessions
      // persist were exactly the ones who never registered.
      // NO navigate() here. `bottom-nav` is registered only while the
      // gate says `authenticated`, so the route does not exist yet at
      // this point in the tick — navigation/Main.jsx resets to it off the
      // status transition instead.
    },
    onError: (err: any) => {
      // Two audiences. The user gets neutral, actionable copy that does
      // not reveal whether the account exists; the log gets Keycloak's
      // own error code, which is the only thing that distinguishes a
      // wrong password (`invalid_grant`) from a misconfigured client
      // (`invalid_client`). Before this, both showed "Request failed with
      // status code 401" and neither audience was served.
      // eslint-disable-next-line no-console
      console.warn('[auth] sign-in failed —', authFailureDetail(err));
      toast.show(describeAuthFailure(err), toast.LONG);
    },
  });

  const handleSignin = (props: any) => {
    Keyboard.dismiss();
    loginMutation.mutate(props);
  };

  return {loginMutation, handleSignin};
};

const getActiveAgreement = async (response: any) => {
  try {
    return await AgreementServices.getActiveAgreement(response?.access_token);
  } catch (error) {
    return DEFAULT_AGREEMENT; // Return an empty object if an error occurs
  }
};

const getCurrentAgreement = async (response: any) => {
  try {
    return await AgreementServices.getAgreements(0, 5, response?.access_token);
  } catch (error) {
    return null;
  }
};

async function login(props: any) {
  // login
  const response = await AuthServices.login(props);

  // Run getProfile and getActiveAgreement in parallel
  const [userProfile, activeAgreement] = await Promise.all([
    AuthServices.getProfile(response?.access_token).catch(() => ({})),
    getActiveAgreement(response),
  ]);

  // Get the first current agreement if there is no active agreement
  let inactiveAgreement = null;
  if (!activeAgreement?.id) {
    const agreements = await getCurrentAgreement(response);
    inactiveAgreement = agreements?.content[0] || null;
  }

  // return login response
  return {
    userProfile,
    activeAgreement,
    inactiveAgreement,
    ...response,
  };
}
