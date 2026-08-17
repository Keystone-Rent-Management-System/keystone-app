// Identity material captured during the DEMO onboarding journey.
//
// MEMORY ONLY. Deliberately not zustand+MMKV like every other store in
// this folder, and that difference is the whole point:
//
//   · MMKV here has no encryption key (see MMKV.js), so anything written
//     to it sits in a readable file on the device.
//   · An SSN and a photograph of a driver's licence are among the most
//     damaging things this app could ever hold. In a SIMULATION they buy
//     nothing by surviving a relaunch.
//
// The SSN lives in module scope only: gone when the process dies, never
// written to disk, never sent to a server, never attached to telemetry.
// The PHOTO is a file by nature, so it is copied into our own cache and
// deleted on clear — see setDemoIdPhoto. Only the last four of the SSN
// are ever readable back; the photo path IS fully readable, because the
// thumbnail has to show it. Those are different protections and the
// difference is deliberate.
// If a future change needs these to persist, that is a decision to take
// deliberately with a real secure store — not by swapping this file for
// a zustand `persist()` because it looked like the neighbouring ones.
//
// `AboutYou.jsx` states that the real onboarding form collects NO
// identifiers — no SSN, no date of birth. That remains true. This is the
// simulated screening step, reachable only under `__DEV__` + Fixtures,
// and it exists so the flow can be judged before it is built for real.

let ssn = null;
let idPhotoPath = null;
let idPhotoCapturedAt = null;

/** Store the SSN for the current demo run. Never persisted. */
export const setDemoSsn = value => {
  ssn = value ? String(value) : null;
};

/**
 * Only ever the last four, and only for display.
 *
 * The full value is never handed back out — a screen that cannot read it
 * cannot accidentally render it, log it, or put it in a request body.
 */
export const demoSsnLast4 = () => (ssn && ssn.length >= 4 ? ssn.slice(-4) : null);

export const hasDemoSsn = () => !!ssn;

// THE PHOTO IS COPIED, NOT REFERENCED.
//
// `launchCamera`/`launchImageLibrary` hand back a path into a store we do
// not own — a `content://` provider cache on Android, possibly `ph://` on
// iOS, or the camera roll. Holding that URI is what made the screen's
// promise false: the module variable died with the process, and the
// FILE did not. "Disappears when you close the app" was true of our
// reference and untrue of the photograph.
//
// So: copy into our own CACHE directory (not Documents — the OS evicting
// it is a failure mode in our favour), keep only our path, and delete
// that file on clear. The picker's URI is never retained.
const CACHE_NAME = 'keystone-demo-licence.jpg';

const fsOf = () => {
  // eslint-disable-next-line global-require
  const RNBlobUtil = require('react-native-blob-util');
  return RNBlobUtil?.default?.fs ?? RNBlobUtil?.fs ?? null;
};

const cachePath = () => {
  const fs = fsOf();
  const dir = fs?.dirs?.CacheDir;
  return dir ? `${dir}/${CACHE_NAME}` : null;
};

// The picker hands back a file:// URI; blob-util's fs.cp wants a plain
// filesystem path and reports "source doesn't exist" for the URI form —
// which surfaced as "We couldn't save that photo" on every capture.
// Percent-decoding matters too: iOS tmp paths contain spaces.
const toFsPath = uri => {
  if (!uri || !uri.startsWith('file://')) return uri;
  const path = uri.slice('file://'.length);
  try {
    return decodeURIComponent(path);
  } catch (err) {
    return path;
  }
};

/**
 * Copy the picked asset into our cache and keep OUR path.
 *
 * Returns the stored path, or null if the copy failed — in which case
 * nothing is retained at all. Holding the picker URI as a fallback would
 * re-introduce exactly the reference we promised to be able to delete.
 */
export const setDemoIdPhoto = async pickedUri => {
  clearIdPhotoRef();
  if (!pickedUri) return null;
  const fs = fsOf();
  const dest = cachePath();
  if (!fs?.cp || !dest) return null;
  try {
    if (await fs.exists(dest)) {
      // A second capture must not leave the first behind.
      await fs.unlink(dest);
    }
    await fs.cp(toFsPath(pickedUri), dest);
    idPhotoPath = dest;
    idPhotoCapturedAt = Date.now();
    return dest;
  } catch (err) {
    idPhotoPath = null;
    idPhotoCapturedAt = null;
    return null;
  }
};

/**
 * The stored path, for the on-screen thumbnail.
 *
 * NOTE this IS a full-value getter — unlike the SSN, which is only ever
 * readable as its last four. The image has to be readable to be shown
 * back to the person who took it. The protection here is different in
 * kind: not "unreadable", but "ours, and deletable".
 */
export const getDemoIdPhoto = () => idPhotoPath;
export const hasDemoIdPhoto = () => !!idPhotoPath;
export const demoIdPhotoCapturedAt = () => idPhotoCapturedAt;

const clearIdPhotoRef = () => {
  idPhotoPath = null;
  idPhotoCapturedAt = null;
};

/**
 * Forget everything, and DELETE the photo from disk.
 *
 * Returns true only when there is nothing left. A failed unlink returns
 * false so the caller can say so — reporting "cleared from this device"
 * over a file that is still there would be a false success on the one
 * screen whose entire purpose is an honest privacy claim, which is the
 * defect this whole effort exists to catch.
 *
 * The in-memory reference is dropped either way: this process stops being
 * able to show the photo even if the file survives.
 */
export const clearDemoIdentity = async () => {
  ssn = null;
  const path = idPhotoPath;
  clearIdPhotoRef();
  if (!path) return true;
  const fs = fsOf();
  if (!fs?.unlink) return false;
  try {
    if (await fs.exists(path)) await fs.unlink(path);
    return !(await fs.exists(path));
  } catch (err) {
    return false;
  }
};

export default {
  setDemoSsn,
  demoSsnLast4,
  hasDemoSsn,
  setDemoIdPhoto,
  getDemoIdPhoto,
  hasDemoIdPhoto,
  demoIdPhotoCapturedAt,
  clearDemoIdentity,
};
