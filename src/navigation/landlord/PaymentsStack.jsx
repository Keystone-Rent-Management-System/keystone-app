import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PaymentZone} from '@/screens';
import {titleStyling} from '../options';

const Stack = createStackNavigator();

const PaymentsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
    initialRouteName="payment_zone">
    {/* Hub draws its own kit Screen title (S2) */}
    <Stack.Screen name="payment_zone" component={PaymentZone} />
  </Stack.Navigator>
);

export default PaymentsStack;
