import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNav from './navigation/Main';
import SplashScreen from 'react-native-splash-screen';

const Main = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <MainNav />
    </NavigationContainer>
  );
};

export default Main;
