/* eslint-env jest */
//
// The demo simulation exists so the product can be walked before its
// backends exist. It is the exact opposite of what constants/capabilities
// is for, so the containment is the part that has to be right.
//
// Two independent locks, and these tests assert BOTH — either alone would
// eventually be loosened by someone who did not know the other was
// load-bearing.

let mockUseMocks = false;
jest.mock('../src/services/mocks', () => ({
  get USE_MOBILE_MOCKS() {
    return mockUseMocks;
  },
}));

const loadCaps = () => require('../src/constants/capabilities');

beforeEach(() => {
  global.__demoFs?.reset();
  if (global.__demoFs) {
    global.__demoFs.failNextUnlink = false;
    global.__demoFs.failNextCp = false;
  }
  jest.resetModules();
  mockUseMocks = false;
  global.__DEV__ = true;
});

afterEach(() => {
  global.__DEV__ = true;
});

describe('lock 1 — the data source must be Fixtures', () => {
  it('payments stay unavailable in a debug build pointed at LIVE', () => {
    // A debug build talking to the real backend must behave honestly.
    // This is the lock that matters day to day, because __DEV__ is true
    // for every build a developer runs.
    mockUseMocks = false;
    const {can} = loadCaps();
    expect(can('rentPayments')).toBe(false);
    expect(can('paymentMethods')).toBe(false);
    expect(can('identityVerification')).toBe(false);
  });

  it('payments become available in Fixtures', () => {
    mockUseMocks = true;
    const {can} = loadCaps();
    expect(can('rentPayments')).toBe(true);
    expect(can('identityVerification')).toBe(true);
  });

  it('flipping the source back to Live turns the simulation off', () => {
    // `USE_MOBILE_MOCKS` is a live binding, so this must not need a
    // relaunch — a captured copy would strand the app claiming it can
    // take payments against the real gateway.
    mockUseMocks = true;
    const {can} = loadCaps();
    expect(can('rentPayments')).toBe(true);

    mockUseMocks = false;
    expect(can('rentPayments')).toBe(false);
  });
});

describe('lock 2 — release builds cannot reach it at all', () => {
  it('stays false in a release build even in Fixtures', () => {
    global.__DEV__ = false;
    mockUseMocks = true;
    const {can, isDemoMode} = loadCaps();
    expect(isDemoMode()).toBe(false);
    expect(can('rentPayments')).toBe(false);
    expect(can('identityVerification')).toBe(false);
    expect(can('tenantScreening')).toBe(false);
  });

  it('a REAL capability is unaffected by either lock', () => {
    // The demo path must not be able to turn a real capability OFF.
    global.__DEV__ = false;
    mockUseMocks = false;
    const {can} = loadCaps();
    expect(can('notificationPreferences')).toBe(true);
  });

  it('does not silently grant capabilities that are not demo-listed', () => {
    // Only the journey being simulated is opened up. Credit reporting and
    // insurance involve third parties who have made no such promise.
    global.__DEV__ = true;
    mockUseMocks = true;
    const {can} = loadCaps();
    expect(can('creditReporting')).toBe(false);
    expect(can('rentInsurance')).toBe(false);
    expect(can('complianceNotices')).toBe(false);
    expect(can('tenantSelfRegistration')).toBe(false);
  });
});

describe('demo identity material never reaches storage', () => {
  it('is not a persisted store', () => {
    // Every other store in provider/store uses zustand + MMKV, which has
    // no encryption key. An SSN and a licence photograph must not follow
    // that pattern just because they sit in the same folder.
    const {read} = require('./helpers/source');
    const src = read('provider/store/demoIdentity.js');
    expect(src).not.toMatch(/persist\(/);
    expect(src).not.toMatch(/ZustandStorage/);
    expect(src).not.toMatch(/MMKV/);
    expect(src).not.toMatch(/AsyncStorage/);
    expect(src).not.toMatch(/keychain/i);
  });

  it('never hands back the full SSN', () => {
    const id = require('../src/provider/store/demoIdentity');
    id.setDemoSsn('123456789');
    expect(id.demoSsnLast4()).toBe('6789');
    expect(id.hasDemoSsn()).toBe(true);
    // There is no getter for the whole value — a screen that cannot read
    // it cannot render, log or transmit it.
    expect(Object.keys(id)).not.toContain('getDemoSsn');
    expect(JSON.stringify(id)).not.toContain('123456789');
  });

  it('the picker URI is never what gets stored', () => {
    // The defect: `launchCamera` hands back a path into a store we do not
    // own. Holding it made "disappears when you close the app" false —
    // our variable died, the photograph did not.
    const id = require('../src/provider/store/demoIdentity');
    return id.setDemoIdPhoto('content://media/external/images/9931').then(() => {
      expect(id.getDemoIdPhoto()).not.toBe('content://media/external/images/9931');
      expect(id.getDemoIdPhoto()).toContain('/tmp/cache/');
      expect(global.__demoFs.files.has(id.getDemoIdPhoto())).toBe(true);
    });
  });

  it('after clear, the FILE does not exist — not merely the reference', async () => {
    // Asserting the getter returns null passes with the image still on
    // disk, which is the exact bug. This asserts absence.
    const id = require('../src/provider/store/demoIdentity');
    const path = await id.setDemoIdPhoto('content://picked');
    expect(global.__demoFs.files.has(path)).toBe(true);

    const ok = await id.clearDemoIdentity();

    expect(ok).toBe(true);
    expect(global.__demoFs.files.has(path)).toBe(false);
    expect(id.getDemoIdPhoto()).toBeNull();
    expect(id.hasDemoSsn()).toBe(false);
  });

  it('a second capture leaves no orphan behind', async () => {
    const id = require('../src/provider/store/demoIdentity');
    const first = await id.setDemoIdPhoto('content://one');
    const second = await id.setDemoIdPhoto('content://two');
    await id.clearDemoIdentity();
    // One capture replacing another must not strand the first.
    expect(global.__demoFs.files.size).toBe(0);
    expect(first).toBe(second); // same demo-scoped name, overwritten
  });

  it('a FAILED deletion does not report success', async () => {
    // The test that matters most, and the one a spy assertion cannot
    // express: "Cleared from this device" over a file that is still there
    // would be a false success on the one screen whose entire purpose is
    // an honest privacy claim.
    const id = require('../src/provider/store/demoIdentity');
    const path = await id.setDemoIdPhoto('content://picked');
    global.__demoFs.failNextUnlink = true;

    const ok = await id.clearDemoIdentity();

    expect(ok).toBe(false);
    expect(global.__demoFs.files.has(path)).toBe(true); // still there
    // …and this process can no longer show it either way.
    expect(id.getDemoIdPhoto()).toBeNull();
  });

  it('a failed COPY retains nothing at all', async () => {
    // If the copy fails there is nothing to delete — but we must not be
    // left holding the picker URI we promised to be able to delete.
    const id = require('../src/provider/store/demoIdentity');
    global.__demoFs.failNextCp = true;
    const path = await id.setDemoIdPhoto('content://picked');
    expect(path).toBeNull();
    expect(id.getDemoIdPhoto()).toBeNull();
    expect(id.hasDemoIdPhoto()).toBe(false);
  });

  it('the module retains no picker-derived value', () => {
    const {read} = require('./helpers/source');
    const src = read('provider/store/demoIdentity.js');
    // The only assignment to the path is our own cache destination.
    expect(src).toMatch(/idPhotoPath = dest;/);
    expect(src).not.toMatch(/idPhotoPath = pickedUri/);
    expect(src).not.toMatch(/idPhoto = uri/);
  });

  it('does not survive a process restart', () => {
    const id = require('../src/provider/store/demoIdentity');
    id.setDemoSsn('123456789');
    // A fresh module registry is the closest analogue to a relaunch.
    jest.resetModules();
    const fresh = require('../src/provider/store/demoIdentity');
    expect(fresh.hasDemoSsn()).toBe(false);
  });
});
