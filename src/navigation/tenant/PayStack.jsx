import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  PayHub,
  PayRent,
  RentReceipt,
  Autopay,
  PaymentMethods,
  KycVerify,
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
    {/* Migrated screens draw their own kit Screen headers (S2). */}
    <Stack.Screen name="pay_hub" component={PayHub} />
    <Stack.Screen name="pay_rent" component={PayRent} />
    <Stack.Screen name="rent_receipt" component={RentReceipt} />
    <Stack.Screen name="autopay" component={Autopay} />
    <Stack.Screen name="payment_methods" component={PaymentMethods} />
    <Stack.Screen name="kyc_verify" component={KycVerify} />
    <Stack.Screen name="receipts" component={Receipts} />
    <Stack.Screen name="statements" component={Statements} />
  </Stack.Navigator>
);

export default PayStack;
