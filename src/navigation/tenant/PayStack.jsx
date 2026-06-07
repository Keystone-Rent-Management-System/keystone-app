import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  PayHub,
  PayRent,
  RentReceipt,
  Autopay,
  PaymentMethods,
  Receipts,
  Statements,
} from '@/screens';
import COLORS from '../../constants/Theme';

const Stack = createStackNavigator();

const titleStyle = {
  color: COLORS.primary,
  fontSize: 18,
  fontFamily: 'Inter-SemiBold',
};
const opts = title => ({
  headerShown: true,
  title,
  headerShadowVisible: false,
  headerTitleStyle: titleStyle,
});

// Tenant "Pay" tab — the money hub (mirrors the landlord Payments tab).
const PayStack = () => (
  <Stack.Navigator
    screenOptions={{headerShown: false, animationEnabled: true}}
    initialRouteName="pay_hub">
    <Stack.Screen name="pay_hub" component={PayHub} options={opts('Pay')} />
    <Stack.Screen name="pay_rent" component={PayRent} options={opts('Pay rent')} />
    <Stack.Screen name="rent_receipt" component={RentReceipt} options={opts('Receipt')} />
    <Stack.Screen name="autopay" component={Autopay} options={opts('Autopay')} />
    <Stack.Screen name="payment_methods" component={PaymentMethods} options={opts('Payment methods')} />
    <Stack.Screen name="receipts" component={Receipts} options={opts('Receipts')} />
    <Stack.Screen name="statements" component={Statements} options={opts('Statement')} />
  </Stack.Navigator>
);

export default PayStack;
