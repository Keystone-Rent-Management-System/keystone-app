import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  Credit,
  Help,
  RentersInsurance,
  NotificationPrefs,
  More,
  MoreAccountDetails,
} from '../screens';
import COLORS from '../constants/Theme';
import Complains from '../screens/more/landlord/complains';

const Stack = createStackNavigator();
const MoreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="default">
      <Stack.Screen name={'default'} component={More} />
      {/* Account details draws its own kit Screen header (S2) */}
      <Stack.Screen
        name={'more__account_details'}
        component={MoreAccountDetails}
      />
      <Stack.Screen name={'more__complains'} component={Complains} />
      {/* Credit draws its own kit Screen header (S2) */}
      <Stack.Screen name={'credit'} component={Credit} />
      {/* Migrated screens draw their own kit Screen headers (S2) */}
      <Stack.Screen name={'insurance'} component={RentersInsurance} />
      <Stack.Screen name={'help'} component={Help} />
      <Stack.Screen name={'notification_prefs'} component={NotificationPrefs} />
    </Stack.Navigator>
  );
};

export default MoreStack;

const commonOptionsWithHeader = {
  headerShown: true,
  title: '',
  headerTitleStyle: {
    color: COLORS.primary,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginHorizontal: 'auto',
  },
};
