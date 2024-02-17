import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {More, MoreAccountDetails} from '../screens';
import COLORS from '../constants/Theme';

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
        options={{
          headerShown: true,
          title: '',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MoreStack;
