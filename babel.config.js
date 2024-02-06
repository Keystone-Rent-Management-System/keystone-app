module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: {
          '@': './src', // Adjust as needed for your project structure
        },
      },
    ],
  ],
};
