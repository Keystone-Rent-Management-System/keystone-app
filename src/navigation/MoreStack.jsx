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
      <Stack.Screen
        name={'more__account_details'}
        component={MoreAccountDetails}
        options={commonOptionsWithHeader}
      />
      <Stack.Screen
        name={'more__complains'}
        component={Complains}
        options={{...commonOptionsWithHeader, title: 'My Complaints'}}
      />
      <Stack.Screen
        name={'credit'}
        component={Credit}
        options={{...commonOptionsWithHeader, title: 'Credit building'}}
      />
      <Stack.Screen
        name={'insurance'}
        component={RentersInsurance}
        options={{...commonOptionsWithHeader, title: 'Renters insurance'}}
      />
      <Stack.Screen
        name={'help'}
        component={Help}
        options={{...commonOptionsWithHeader, title: 'Help & contact'}}
      />
      <Stack.Screen
        name={'notification_prefs'}
        component={NotificationPrefs}
        options={{...commonOptionsWithHeader, title: 'Notifications'}}
      />
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
