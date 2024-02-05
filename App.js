/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {enableLatestRenderer} from 'react-native-maps';

import Main from './src/Main';

enableLatestRenderer();

function App() {
  return (
    <GestureHandlerRootView style={styles.gestureProvider}>
      <Main />
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  gestureProvider: {
    flex: 1,
  },
});
