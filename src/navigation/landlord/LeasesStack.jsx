import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {LeaseExpiry} from '@/screens';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

const LeasesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="lease_expiry">
    <Stack.Screen
      name="lease_expiry"
      component={LeaseExpiry}
      options={{
        headerShown: true,
        title: 'Leases',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
  </Stack.Navigator>
);

export default LeasesStack;
