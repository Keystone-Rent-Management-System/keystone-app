import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {ZustandStorage} from './MMKV';
import {setAccessToken} from './secureAuth';

const initState = {
  registering_user: {
    email: '', //registration email(receives token during registration)
    token: '', // sent to email during registration
    firstName: '', // first name of the user
    lastName: '', // last name of the user
    phoneNumber: '', // phone number of the user
    identificationNumber: '', // id number of the user
    identificationType: 'NATIONAL_ID',
    password: '', // password of the user
  },
  signed_in_user: {},
  auth: {
    access_token: '',
    refresh_token: '',
  },
  reset_password: {
    email: '',
    token: '',
  },
};

const useGlobals = create(
  //   save the state to local storage
  persist(
    set => ({
      state: initState,

      // updates reset password state
      updateResetPassword: newState => {
        set(previousState => {
          return {
            state: {
              ...previousState.state,
              reset_password: {
                ...previousState.state.reset_password,
                ...newState,
              },
            },
          };
        });
      },
      // updates registering user
      updateRegisteringUser: newState => {
        set(previousState => {
          return {
            state: {
              ...previousState.state,
              registering_user: {
                ...previousState.state.registering_user,
                ...newState,
              },
            },
          };
        });
      },
      // In-memory mirror ONLY. `auth` is not persisted by zustand (see
      // partialize) and this does not write to the secure store either:
      // durability belongs to `secureAuth.persistSession`, which callers
      // await. This used to fire an un-awaited `saveRefreshToken` here,
      // so every refresh wrote the rotated token twice and neither write
      // was ordered against anything.
      updateAuth: newState => {
        set(previousState => {
          return {
            state: {
              ...previousState.state,
              auth: {
                ...previousState.state.auth,
                ...newState,
              },
            },
          };
        });
      },
      resetResetPassword: () =>
        set(previousState => ({
          ...previousState,
          reset_password: initState.reset_password,
        })),
      // reset registering user state
      resetRegisteringUser: () =>
        set(previousState => ({
          ...previousState,
          registering_user: initState.registering_user,
        })),
      //     resets state to empty
      //
      // This clears the zustand mirror and the in-memory access token
      // ONLY. Deleting the refresh token from the secure store belongs to
      // `endSession()` (provider/store/authSession), which is async and
      // awaitable.
      //
      // It used to call `clearSession()` here and drop the promise. That
      // made sign-out a fire-and-forget native call inside a synchronous
      // store setter: nothing could await the deletion, so the UI said
      // "signed out" before it had happened, and a rejected delete became
      // an unhandled rejection rather than something the user was told
      // about.
      resetState: () =>
        set(() => {
          setAccessToken(null);
          return {state: initState};
        }),
    }),

    // local storage configuration:
    {
      name: '_state_auth', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => ZustandStorage), // (optional) by default, 'localStorage' is used

      // Deep-merge the persisted slice over the defaults.
      //
      // Zustand's default merge is SHALLOW, and `partialize` below drops
      // keys by setting them undefined — which JSON.stringify omits
      // entirely. The shallow merge then replaced the whole `state`
      // object with the persisted one, so `state.auth` came back
      // undefined and `state.auth.refresh_token` threw inside the
      // refresh interceptor. The app sat on its loading spinner forever.
      // Restoring the default shape keeps every consumer's assumptions
      // true while still persisting nothing sensitive.
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        state: {...current.state, ...(persisted?.state ?? {})},
      }),

      // Keep short-lived secrets OUT of an unencrypted store (see MMKV.js
      // — there is no encryption key).
      //
      //  · `registering_user` held a plaintext password and a government
      //    ID number, for a signup that always returned 422 and has now
      //    been removed entirely.
      //  · `reset_password` holds an emailed password-reset token. It is
      //    only needed for the few seconds between the code screen and
      //    the new-password screen, so persisting it just leaves a live
      //    account-recovery token on disk.
      //
      // The session tokens in `auth` DO still persist — that is what keeps
      // a user signed in — and they remain unencrypted at rest. That is
      // the open item documented in MMKV.js; do not describe this storage
      // as encrypted until it is fixed.
      //  · `auth` (access + refresh tokens) no longer persists here at
      //    all. Session storage moved to provider/store/secureAuth —
      //    Keychain/Keystore where available, memory otherwise. The
      //    migration is a forced re-login, not a copy: an already-exposed
      //    plaintext session should not be carried forward.
      partialize: state => ({
        ...state,
        state: {
          ...state.state,
          registering_user: undefined,
          reset_password: undefined,
          auth: undefined,
        },
      }),
    },
  ),
);

export default useGlobals;
