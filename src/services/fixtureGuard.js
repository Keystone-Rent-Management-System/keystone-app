import {USE_MOBILE_MOCKS} from './mocks';

// The write-side counterpart to services/unavailable.js.
//
// Fixtures mode has to be airtight in BOTH directions. Reads were already
// sealed, but every mutation still went straight to the live gateway, so a
// screen full of demo data could produce real consequences under the
// signed-in account: a real complaint, a real repair ticket, or a notice to
// vacate quoting a fixture agreement id (`agr-4b-2025`) that belongs to
// nobody. Someone reviewing fixture data has no reason to expect that.
//
// This guard belongs in the SERVICE layer, not in screens. Screens are the
// wrong boundary — each new caller would have to remember the check, and
// the one that forgot is exactly the bug. Every mutation routes through a
// service, so guarding here covers callers that don't exist yet.
//
// Fixtures mode resolves locally rather than throwing: the mode exists to
// demo complete journeys, and a demo that errors at every write is useless.
// The distinction is safe because the mode is __DEV__-only and clearly
// labelled in the UI — no release build can reach it.
//
// AUTH IS DELIBERATELY NOT GUARDED. Sign-in, refresh, logout and password
// reset must reach the real identity provider in every mode; a fake login
// would be its own false-success bug.

const logged = new Set();

/**
 * Call at the top of a mutating service function.
 * @param {string} label e.g. 'POST /general-assistance'
 * @param {object} [result] what to resolve with in Fixtures mode
 * @returns {Promise|null} a resolved promise to return, or null to proceed
 */
export const blockedInFixtureMode = (label, result = {}) => {
  if (!USE_MOBILE_MOCKS) {
    return null;
  }
  if (!logged.has(label)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[fixtures] ${label} was NOT sent — data source is set to Fixtures.`,
    );
    logged.add(label);
  }
  return Promise.resolve({status: 'fixture', fixture: true, ...result});
};

export default blockedInFixtureMode;
