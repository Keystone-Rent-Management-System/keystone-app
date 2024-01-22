/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import Main from './src/Main';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

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
