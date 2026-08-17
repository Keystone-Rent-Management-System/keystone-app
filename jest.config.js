const rnPreset = require('react-native/jest-preset');

module.exports = {
  preset: 'react-native',

  // __tests__/helpers holds shared source-reading utilities, not suites.
  // Jest treats every file under __tests__ as a test by default and fails
  // the run with "must contain at least one test".
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers/'],

  // React Native's preset transforms `js|ts|tsx` — it does NOT include
  // `jsx`, and most of this app's screens and components are .jsx files.
  // Anything ending .jsx therefore reached Jest untransformed and threw
  // "Cannot use import statement outside a module" the moment a test
  // imported it. Extend the preset's map rather than replace it, so the
  // asset transformer (png/svg/…) is preserved.
  transform: {
    ...rnPreset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // The preset's transformIgnorePatterns assumes a flat node_modules
  // (`node_modules/react-native/...`). This install uses a pnpm layout, so
  // the real path is
  //   node_modules/.pnpm/@react-native+js-polyfills@0.76.9/node_modules/@react-native/js-polyfills/...
  // which the default pattern misses. React Native's own sources are
  // Flow-typed, so they went untransformed and every suite died on
  // `SyntaxError: Unexpected identifier 'ErrorHandler'`.
  // The `(.*/)?` prefix lets a package match at any depth, so this works
  // under both a pnpm and a flat layout.
  transformIgnorePatterns: [
    'node_modules/(?!(.*/)?(react-native|@react-native|@react-native-community|@react-navigation|nativewind|react-native-.*|rn-.*|@shopify|@gorhom|zustand|@uidotdev)/)',
  ],

  // Native modules have no JS implementation under Jest, so anything that
  // reaches TurboModuleRegistry.getEnforcing throws on import. Keep the
  // preset's own setup first — replacing it breaks the RN environment.
  setupFiles: [
    ...rnPreset.setupFiles,
    './node_modules/react-native-gesture-handler/jestSetup.js',
    './jest.setup.js',
  ],
};
