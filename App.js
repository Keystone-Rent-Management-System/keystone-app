/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

import Main from './src/Main';
import RemoteNotification from './src/components/notifications';

function App() {
  return (
    <GestureHandlerRootView style={styles.gestureProvider}>
      <RemoteNotification />

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
