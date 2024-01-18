import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainNav from './navigation/Main';

const Main = () => {
  return (
    <NavigationContainer>
      <MainNav />
    </NavigationContainer>
  );
};

export default Main;
