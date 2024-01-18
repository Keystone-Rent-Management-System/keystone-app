import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import BottomNav from './BottomNav';

const Stack = createStackNavigator();
const MainNav = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="bottom-nav">
      <Stack.Screen name={'bottom-nav'} component={BottomNav} />
    </Stack.Navigator>
  );
};

export default MainNav;
