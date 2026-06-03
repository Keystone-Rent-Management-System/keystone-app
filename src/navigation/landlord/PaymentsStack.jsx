import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PaymentZone, Payout} from '@/screens';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

const PaymentsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="payment_zone">
    <Stack.Screen
      name="payment_zone"
      component={PaymentZone}
      options={{
        headerShown: true,
        title: 'Payments',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
    <Stack.Screen
      name="payout"
      component={Payout}
      options={{
        headerShown: true,
        title: 'Instant Payout',
        headerShadowVisible: false,
        headerTitleStyle: titleStyling,
      }}
    />
  </Stack.Navigator>
);

export default PaymentsStack;
