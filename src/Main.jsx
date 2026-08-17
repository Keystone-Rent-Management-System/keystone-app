import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNav from './navigation/Main';
import SplashScreen from 'react-native-splash-screen';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as RootNavigation from './RootNavigation';
import {useDeepLinkUrlListener, useInitialURL} from './hooks';
import RemoteNotification from './components/notifications';
import {useAuthBootstrap} from './hooks/useAuthBootstrap';
import {BOOTSTRAPPING} from './provider/store/authSession';
// Side-effect import: registers the __keystoneDev DevTools-console bridge
// (self-gated on __DEV__ — an empty module in release).
import './provider/store/devConsoleBridge';

// One cache for the app's lifetime. Created at module scope so a re-render
// of <Main> can never replace it.
// Don't retry deterministic failures.
//
// The default policy (3 retries with backoff) applied to a 401 or a dead
// session meant the honest "we couldn't load this" state took over three
// minutes to appear on a signed-out device — long enough that a reviewer
// reasonably reads it as a hang. Retrying helps a flaky network; it
// cannot help an expired session or a route that does not exist, and
// while it spins the user is shown a loading state that is itself a
// claim ("this is coming").
const isDeterministic = error => {
  if (error?.isAuthFailure) return true;
  const status = error?.response?.status;
  // 4xx is the server saying "asking again won't change this".
  return typeof status === 'number' && status >= 400 && status < 500;
};

const sharedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !isDeterministic(error) && failureCount < 2,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

const Main = () => {
  // THE GATE. One authority for whether a session exists, and a launch
  // state that is neither branch.
  const status = useAuthBootstrap();
  const bootstrapping = status === BOOTSTRAPPING;

  useEffect(() => {
    // The native splash stays up for exactly as long as the question is
    // open. Hiding it on mount meant the first thing a returning user saw
    // was the signed-out Welcome screen, which then swapped itself for
    // their home screen once the refresh landed — the app telling them
    // they were logged out and then correcting itself.
    if (!bootstrapping) SplashScreen.hide();
  }, [bootstrapping]);

  // Tenant deep-links are scoped to the /app/* path prefix on the dev host so they never
  // collide with the landlord web app (/, /dashboard, ...) served on the same host. The
  // backend tenant emails must emit dev.keystonerent.app/app/... (keystone-backend #159).
  // assetlinks.json (release-key SHA, keystone-app #158) at /.well-known/ finalizes app-link
  // verification. Full per-screen path map + on-device verification tracked in #157.
  const linking = {
    prefixes: ['https://dev.keystonerent.app/app'],
    config: {
      screens: {
        auth__claim: 'claim', // /app/claim?code=KS-XXXXXX (tenant invite)
        invoice_view: 'invoices/:id', // /app/invoices/:id
        agreements_current: 'agreements', // /app/agreements
      },
    },
  };

  useInitialURL();
  useDeepLinkUrlListener();

  // Module-scope, NOT per-render. `new QueryClient()` inside the component
  // built a fresh cache on every re-render of Main, so every cached query
  // was discarded and each screen refetched from scratch — the cache was
  // effectively disabled app-wide.
  const queryClient = sharedQueryClient;

  return (
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        {/* Nothing below this line mounts while the session question is
            open. The navigator is where both the protected tree and the
            authenticated queries live, so gating it here — rather than
            per-screen — is what makes "no authenticated query runs during
            bootstrapping" true by construction instead of by review.
            RemoteNotification is inside the gate deliberately: it
            registers a device token against the signed-in user. */}
        {bootstrapping ? null : (
          <NavigationContainer
            linking={linking}
            ref={RootNavigation.navigationRef}>
            <RemoteNotification />
            <MainNav />
          </NavigationContainer>
        )}
      </BottomSheetModalProvider>
    </QueryClientProvider>
  );
};

export default Main;
