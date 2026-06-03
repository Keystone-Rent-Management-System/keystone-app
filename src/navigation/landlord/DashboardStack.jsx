import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {LandlordDashboard} from '@/screens';

const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="dashboard__home">
    <Stack.Screen name="dashboard__home" component={LandlordDashboard} />
  </Stack.Navigator>
);

export default DashboardStack;
