import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNav from './navigation/Main';
import SplashScreen from 'react-native-splash-screen';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as RootNavigation from './RootNavigation';
import {useDeepLinkUrlListener, useInitialURL} from './hooks';
import RemoteNotification from './components/notifications';

const Main = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

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

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BottomSheetModalProvider>
        <NavigationContainer
          linking={linking}
          ref={RootNavigation.navigationRef}>
          <RemoteNotification />
          <MainNav />
        </NavigationContainer>
      </BottomSheetModalProvider>
    </QueryClientProvider>
  );
};

export default Main;
