import {MMKV} from 'react-native-mmkv';
import {purgeLegacyPlaintextSession} from './secureAuth';

// ⚠️  THIS STORE IS NOT ENCRYPTED AT REST.
//
// `new MMKV({id})` with no `encryptionKey` writes plaintext to the app
// container. What currently lands here includes the Keycloak access
// token, the rotated refresh token, and the signed-in profile — i.e.
// live bearer credentials readable from a device backup, from a jailbroken
// or rooted device, and by anything with filesystem access to the app
// container.
//
// Two things were removed to shrink that surface (see useGlobals):
// `registering_user`, which held a plaintext password and a government
// ID number, and `reset_password`, which held a password-reset token.
// Neither needed to survive a relaunch.
//
// The remaining exposure is the session tokens, and fixing it properly
// needs a key that is itself protected:
//
//   1. add `react-native-keychain` (native dependency, needs pod install
//      + a rebuild);
//   2. on first launch generate 32 random bytes, store them in the
//      Keychain with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (Keystore-backed
//      equivalent on Android);
//   3. pass them here as `encryptionKey`;
//   4. handle the migration — an existing install has an unencrypted
//      store, so read-then-rewrite once, or force a re-login.
//
// That is a native change and a product decision (a forced re-login is
// user-visible), so it is deliberately NOT done silently here. Until it
// is, no screen may claim the app encrypts anything — the "Bank-level
// encryption" line on Welcome was removed for exactly that reason.
export const mmkvStorage = new MMKV({
  id: '_store',
});

// Strip any session written by an earlier build. Runs once at import,
// before the persisted store rehydrates, so a legacy plaintext token is
// never loaded into memory in the first place.
purgeLegacyPlaintextSession(mmkvStorage);

export const ZustandStorage = {
  setItem: (name, value) => {
    return mmkvStorage.set(name, value);
  },
  getItem: name => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  getAllKeys: () => {
    return mmkvStorage.getAllKeys();
  },
  removeItem: name => {
    return mmkvStorage.delete(name);
  },
  clear: () => {
    return mmkvStorage.clearAll();
  },
};
