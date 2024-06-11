import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {ZustandStorage} from './MMKV';

const initState = {
  registering_user: {
    email: '', //registration email(receives token during registration)
    token: '', // sent to email during registration
    name: '', // name of the user
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
      resetState: () =>
        set(() => ({
          state: initState,
        })),
    }),

    // local storage configuration:
    {
      name: '_state_auth', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => ZustandStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

export default useGlobals;
