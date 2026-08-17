/* eslint-env jest */
// Stubs for native modules that have no JS implementation under Jest.
// Without these, importing App.js throws at module load — which is why the
// only integration-level suite in the repo could never run.

jest.mock('react-native-splash-screen', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: (k, v) => store.set(k, String(v)),
      getString: k => store.get(k),
      getBoolean: k => store.get(k) === 'true',
      getNumber: k => Number(store.get(k)),
      delete: k => store.delete(k),
      clearAll: () => store.clear(),
      contains: k => store.has(k),
    })),
  };
});

jest.mock('react-native-version-check', () => ({
  getCurrentVersion: () => '1.4.0',
  needUpdate: () => Promise.resolve({isNeeded: false}),
}));

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: c => c,
  setUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  ReactNativeTracing: jest.fn(),
  reactNavigationIntegration: () => ({}),
  mobileReplayIntegration: () => ({}),
}));

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  createChannel: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve()),
  FetchResult: {NoData: 'NoData'},
}));

jest.mock('react-native-share', () => ({
  default: {open: jest.fn(() => Promise.resolve())},
  open: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-webview', () => ({WebView: 'WebView'}));

jest.mock('react-native-compressor', () => ({
  Image: {compress: jest.fn(uri => Promise.resolve(uri))},
  Video: {compress: jest.fn(uri => Promise.resolve(uri))},
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({assets: []})),
  launchImageLibrary: jest.fn(() => Promise.resolve({assets: []})),
}));

// File / PDF / blob natives, all reached transitively via utils/Helper.js.
jest.mock('react-native-file-viewer', () => ({open: jest.fn()}));

jest.mock('react-native-html-to-pdf', () => ({
  convert: jest.fn(() => Promise.resolve({filePath: '/tmp/test.pdf'})),
}));

jest.mock('rn-fetch-blob', () => ({
  fs: {dirs: {DocumentDir: '/tmp', DownloadDir: '/tmp'}, writeFile: jest.fn()},
  config: jest.fn(() => ({fetch: jest.fn(() => Promise.resolve({path: () => '/tmp/f'}))})),
}));

// An in-memory filesystem, not a set of spies.
//
// `expect(unlink).toHaveBeenCalled()` passes if the path is wrong, if the
// call throws, or if a second copy was left behind — none of which is
// "the file is gone". Modelling cp/unlink/exists as state lets a test
// assert absence, which is the actual claim the demo screen makes.
const __files = new Set();
global.__demoFs = {
  files: __files,
  reset: () => __files.clear(),
  failNextUnlink: false,
  failNextCp: false,
};

jest.mock('react-native-blob-util', () => ({
  fs: {
    dirs: {DocumentDir: '/tmp', DownloadDir: '/tmp', CacheDir: '/tmp/cache'},
    cp: jest.fn(async (from, to) => {
      if (global.__demoFs.failNextCp) {
        global.__demoFs.failNextCp = false;
        throw new Error('cp failed');
      }
      global.__demoFs.files.add(to);
      return true;
    }),
    unlink: jest.fn(async path => {
      if (global.__demoFs.failNextUnlink) {
        global.__demoFs.failNextUnlink = false;
        throw new Error('unlink failed');
      }
      global.__demoFs.files.delete(path);
    }),
    exists: jest.fn(async path => global.__demoFs.files.has(path)),
  },
  config: jest.fn(() => ({fetch: jest.fn(() => Promise.resolve({path: () => '/tmp/f'}))})),
}));
