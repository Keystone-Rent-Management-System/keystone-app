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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://6d592da0b347029be2400ab07f106938@o4506602287595520.ingest.us.sentry.io/4508793734955008',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],
});
function App() {
  return (
    <GestureHandlerRootView style={styles.gestureProvider}>
      <RemoteNotification />

      <Main />
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  gestureProvider: {
    flex: 1,
  },
});
