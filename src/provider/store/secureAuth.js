// Where session tokens live.
//
// DECISION (2026-08-01): tokens leave the unencrypted MMKV store, and the
// migration is a forced re-login rather than a silent copy. An already-
// exposed plaintext session should not be carried forward — migrating it
// would preserve exactly the credential we are trying to stop trusting.
//
// Two backends:
//
//   Keychain (preferred)   iOS Keychain / Android Keystore, via
//                          `react-native-keychain`, with
//                          WHEN_UNLOCKED_THIS_DEVICE_ONLY so the token
//                          never rides a backup to another device.
//
//   Memory (fallback)      No disk at all. The session lasts until the
//                          process dies, so the user signs in again on
//                          each cold start.
//
// The fallback is deliberately memory, NOT MMKV. If the native module is
// missing the app degrades to "less convenient", never to "writes bearer
// tokens to a plaintext file".
//
// `react-native-keychain` (8.2.0) IS installed and the `RNKeychain` pod
// is integrated, so `hasSecureStore()` is true on a current native build
// and sessions survive a relaunch.
//
// The memory fallback is still load-bearing, and is not dead code: the
// `require` sits inside a try/catch, which Metro treats as an OPTIONAL
// dependency — the JS bundle builds and runs whether or not the native
// module is present. That is what keeps a JS-only bundle update, or a
// stale native build, degrading to "sign in again" rather than crashing
// at import. It is not a substitute for the pod: a build without it
// signs the user out on every cold start.
//
// LOCKFILE NOTE: this repo's node_modules is a mixed pnpm/bun layout and
// the package was installed by extracting the registry tarball directly.
// `bun.lock` therefore has no entry for it. Run a real `bun install` to
// record it before this ships, or a clean checkout will build without
// the module and silently fall back to memory.

const ACCOUNT = 'keystone.session';

let keychain = null;
try {
  // eslint-disable-next-line global-require
  keychain = require('react-native-keychain');
} catch (e) {
  keychain = null;
}

// Access token stays in memory even when Keychain is present: it is
// short-lived (900s) and re-derivable from the refresh token, so there is
// no reason to put it at rest anywhere.
let accessTokenInMemory = null;
let refreshTokenInMemory = null;

// The last native error the secure store returned, kept so a failure is
// diagnosable instead of merely "unavailable". This is what was missing
// when every Keychain call was failing with OSStatus -34018 (missing
// entitlement): the module imported, the methods existed, the writes all
// failed, and the only evidence was a generic warning.
let lastSecureError = null;

export const getSecureStoreError = () => lastSecureError;

const noteSecureError = (op, err) => {
  lastSecureError = {
    op,
    code: err?.code ?? null,
    message: err?.message ?? String(err),
  };
  // eslint-disable-next-line no-console
  console.warn(
    `[auth] secure store ${op} failed (code=${lastSecureError.code}): ` +
      `${lastSecureError.message}`,
  );
  if (String(lastSecureError.code) === '-34018') {
    // errSecMissingEntitlement. This says the app lacks permission for the
    // access group it tried to use — NOT specifically that it has no
    // entitlement at all. A wrong or mismatched group, or a provisioning
    // profile that does not grant the group, produces the same code.
    //
    // We pass no explicit `accessGroup`, so the group in play is the
    // default derived from the app's signed identity. That is why the
    // useful check is the BUILT PRODUCT's signature rather than the
    // entitlements source file.
    // eslint-disable-next-line no-console
    console.warn(
      '[auth] -34018 (errSecMissingEntitlement): this build is not permitted ' +
        'to use the keychain access group it attempted. Inspect the BUILT app, ' +
        'not the source entitlements: `codesign -d --entitlements :- <path>.app`. ' +
        'Expect application-identifier / com.apple.developer.team-identifier to ' +
        'be present and to match the signing profile. Causes include no ' +
        'entitlement, a group the profile does not grant, or a mismatched ' +
        'profile. This is a native signing/build configuration problem; no ' +
        'amount of JS retrying will fix it.',
    );
  }
};

/**
 * Is the native module PRESENT?
 *
 * Deliberately narrow, and not a claim that storage works. It used to be
 * the app's only notion of "do we have secure storage", which overstated
 * what it knows: a linked module whose every call fails with -34018
 * answers true here. Use `probeSecureStore()` for whether the store is
 * actually operational.
 */
export const hasSecureStore = () => !!keychain;

/**
 * Is the secure store OPERATIONAL?
 *
 * Writes, reads back, and deletes a throwaway item. This is the only
 * honest answer, because presence of the module says nothing about
 * entitlements, and an entitlement failure is invisible until a real
 * write is attempted. Cached: the answer cannot change within a process.
 */
const PROBE_SERVICE = 'keystone.secure-probe';
let probeResult = null;

// A PROBE THAT ONLY SPEAKS UP ON FAILURE PROVES NOTHING.
//
// This used to log only errors, so a silent log was ambiguous: it could
// mean the probe passed, or that it never ran, or that the app never
// reached this code. With a simulator and a physical device both feeding
// one unlabelled Metro log, "no -34018 line" was being read as evidence
// of success — which it is not. Every outcome now prints, tagged, so the
// absence of a PROBE line means the probe did not run.
const PROBE_TAG = '[auth][secure-store-probe]';

export const probeSecureStore = async () => {
  if (probeResult !== null) return probeResult;
  if (!keychain) {
    probeResult = false;
    // eslint-disable-next-line no-console
    console.warn(
      `${PROBE_TAG} RESULT=unavailable — react-native-keychain is not linked ` +
        'in this build. Sessions are memory-only and will not survive relaunch.',
    );
    return probeResult;
  }
  try {
    await keychain.setGenericPassword('probe', 'probe', {
      service: PROBE_SERVICE,
      accessible: keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    const read = await keychain.getGenericPassword({service: PROBE_SERVICE});
    await keychain.resetGenericPassword({service: PROBE_SERVICE});
    probeResult = !!read && read.password === 'probe';
    if (!probeResult) {
      noteSecureError('probe', new Error('probe wrote but did not read back'));
      // eslint-disable-next-line no-console
      console.warn(`${PROBE_TAG} RESULT=fail (wrote but did not read back)`);
    } else {
      // SCOPE THE CLAIM TO WHAT WAS ACTUALLY TESTED.
      //
      // This said "sessions will survive relaunch on this build", which
      // is an acceptance outcome, not a probe result. All the probe knows
      // is that one synthetic value survived one write/read/delete inside
      // a single process. It says nothing about whether the real refresh
      // token was stored, whether it is still there after termination,
      // whether the server will accept it, or whether the app recovers
      // the session with it. Announcing relaunch survival here would have
      // let a green log stand in for the sign-in/relaunch test.
      // eslint-disable-next-line no-console
      console.warn(
        `${PROBE_TAG} RESULT=ok — secure storage is operational ` +
          '(synthetic write/read/delete succeeded). This does NOT prove ' +
          'session survival; that still requires the sign-in + relaunch check.',
      );
    }
    return probeResult;
  } catch (err) {
    noteSecureError('probe', err);
    // eslint-disable-next-line no-console
    console.warn(`${PROBE_TAG} RESULT=fail code=${err?.code ?? 'unknown'}`);
    probeResult = false;
    return probeResult;
  }
};

// Test seam only.
export const __resetSecureProbe = () => {
  probeResult = null;
  lastSecureError = null;
};

export const getAccessToken = () => accessTokenInMemory;

export const setAccessToken = token => {
  accessTokenInMemory = token ?? null;
};

/** Persist the refresh token if we have somewhere safe to put it. */
export const saveRefreshToken = async token => {
  refreshTokenInMemory = token ?? null;
  if (!keychain || !token) return false;
  try {
    await keychain.setGenericPassword(ACCOUNT, token, {
      service: ACCOUNT,
      accessible: keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (err) {
    // A Keychain failure must not silently fall back to plaintext — and
    // must not discard the reason either. This used to log a generic
    // "secure store unavailable" and drop `err` on the floor, which is
    // exactly why an OSStatus -34018 (no keychain entitlement) looked
    // like an unexplained memory-only session for as long as it did.
    noteSecureError('write', err);
    return false;
  }
};

/**
 * Write a freshly-issued token pair to the secure store.
 *
 * THE one place a session becomes durable. Both entry points — sign-in
 * and refresh — go through here and await it, so there is a single
 * answer to "is this session recoverable after a restart?".
 *
 * `updateAuth` used to mirror tokens into the store as a side effect of
 * updating zustand, which meant every refresh wrote the rotated token
 * twice: once awaited by the caller that needed the durability
 * guarantee, and once un-awaited from the store setter that could not
 * offer one.
 */
export const persistSession = async tokens => {
  setAccessToken(tokens?.access_token ?? null);
  if (tokens?.refresh_token) {
    return saveRefreshToken(tokens.refresh_token);
  }
  return false;
};

export const loadRefreshToken = async () => {
  if (refreshTokenInMemory) return refreshTokenInMemory;
  if (!keychain) return null;
  try {
    const creds = await keychain.getGenericPassword({service: ACCOUNT});
    refreshTokenInMemory = creds ? creds.password : null;
    return refreshTokenInMemory;
  } catch (err) {
    // A read failure is not "no session" — it is "we cannot tell". The
    // caller still has to treat it as signed out, but the reason must be
    // recorded: a silent null here made an entitlement failure look
    // identical to a genuinely empty store on every cold start.
    noteSecureError('read', err);
    return null;
  }
};

/**
 * Delete the session from memory and from the secure store.
 *
 * Memory is cleared synchronously, before the await: the process must
 * lose the ability to authenticate immediately, not when the native call
 * comes back.
 *
 * A failed deletion REJECTS. It used to be swallowed with "nothing to
 * clear", which is only true when there was nothing stored — for a real
 * Keychain error it meant sign-out reported success while the refresh
 * token stayed on disk, recoverable by the next launch. The caller has
 * to know the difference; it is the difference between a session ended
 * and a session merely forgotten by this process.
 */
export const clearSession = async () => {
  accessTokenInMemory = null;
  refreshTokenInMemory = null;
  if (!keychain) return;
  await keychain.resetGenericPassword({service: ACCOUNT});
};

/**
 * One-time cleanup of the legacy plaintext session.
 *
 * Earlier builds wrote `access_token` and `refresh_token` into the
 * unencrypted MMKV store under `_state_auth`. Those bytes stay on disk
 * until something removes them, so this strips the auth slice from the
 * persisted blob on launch. It does NOT migrate the tokens — the whole
 * point is that they are no longer trusted.
 */
export const SESSION_STORAGE_VERSION = 2;
const VERSION_KEY = '_auth_storage_version';

export const purgeLegacyPlaintextSession = mmkv => {
  try {
    const current = Number(mmkv.getString(VERSION_KEY) ?? '1');
    if (current >= SESSION_STORAGE_VERSION) return false;

    // v1 → v2: sessions moved out of plaintext MMKV. Wipe rather than
    // migrate — a token that has been readable on disk (and, in earlier
    // builds, transmitted to Sentry as a user id) should not be carried
    // into the secure store. One re-login is the cost of not trusting it.
    const raw = mmkv.getString('_state_auth');
    let had = false;
    if (raw) {
      const parsed = JSON.parse(raw);
      const auth = parsed?.state?.state?.auth;
      had = !!(auth?.access_token || auth?.refresh_token);
      if (parsed?.state?.state) {
        parsed.state.state.auth = {access_token: '', refresh_token: ''};
        mmkv.set('_state_auth', JSON.stringify(parsed));
      }
    }
    mmkv.set(VERSION_KEY, String(SESSION_STORAGE_VERSION));
    if (had) {
      // eslint-disable-next-line no-console
      console.warn(
        '[auth] cleared a legacy plaintext session (v1 → v2); sign-in required',
      );
    }
    return had;
  } catch (err) {
    // A failed migration must not leave the old version marker behind,
    // or the wipe silently never happens again.
    try {
      mmkv.delete(VERSION_KEY);
    } catch (e) {
      /* nothing else to do */
    }
    return false;
  }
};
