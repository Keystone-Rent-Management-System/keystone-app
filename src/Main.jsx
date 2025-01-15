import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNav from './navigation/Main';
import SplashScreen from 'react-native-splash-screen';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as RootNavigation from './RootNavigation';
import {useDeepLinkUrlListener, useInitialURL} from './hooks';

const Main = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const linking = {
    prefixes: ['https://pallax-ke.com'],
    config: {
      screens: {
        agreements_current: {
          path: 'current-agreements',
        },
      },
    },
  };

  useInitialURL();
  useDeepLinkUrlListener();

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer linking={linking} ref={RootNavigation.navigationRef}>
        <BottomSheetModalProvider>
          <MainNav />
        </BottomSheetModalProvider>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

export default Main;
