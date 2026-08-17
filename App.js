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
import * as Sentry from '@sentry/react-native';
import {scrubEvent} from './src/utils/sentryScrub';

Sentry.init({
  dsn: 'https://6d592da0b347029be2400ab07f106938@o4506602287595520.ingest.us.sentry.io/4508793734955008',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],
  sendDefaultPii: false,
  beforeSend: scrubEvent,
});

function App() {
  // RemoteNotification used to be mounted here, but it now reads the
  // react-query client (to invalidate dashboard/payment-zone caches
  // on PAYMENT_RECEIVED pushes), so it must live INSIDE the
  // QueryClientProvider — which lives in Main. RN remounts it there.
  return (
    <GestureHandlerRootView style={styles.gestureProvider}>
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
