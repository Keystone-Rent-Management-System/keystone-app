import {Alert, Platform, ToastAndroid} from 'react-native';

// Cross-platform replacement for direct `ToastAndroid` calls.
//
// React Native ships a no-op ToastAndroid on every non-Android platform:
// `show()` just logs "ToastAndroid is not supported on this platform"
// to the console. It does not throw, so this never surfaced as a crash
// — it silently swallowed ~80 user-facing messages on iOS, including
// every login and registration failure. Pointing the app at the real
// backend made that urgent: a wrong password on iOS produced no visible
// feedback whatsoever.
//
// Android keeps the native toast. iOS gets an Alert — modal rather than
// transient, but a message the user actually receives beats a prettier
// one they never see. Swap the iOS branch for an in-app snackbar when
// one exists; every caller goes through here, so it's a one-line change.
//
// Drop-in: same `show(message, duration)` shape and SHORT/LONG constants
// as ToastAndroid, so migrating a call site is just swapping the import.

const show = (message: string, _duration?: number) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, _duration ?? ToastAndroid.SHORT);
    return;
  }
  Alert.alert('', message, [{text: 'OK'}], {cancelable: true});
};

export const toast = {
  show,
  SHORT: ToastAndroid.SHORT,
  LONG: ToastAndroid.LONG,
};

export default toast;
