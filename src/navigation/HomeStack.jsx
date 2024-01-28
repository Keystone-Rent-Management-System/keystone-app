import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Home} from '@/screens';
import InvoiceTopTabNav from './InvoiceTopTabNav';
import COLORS from '../constants/Theme';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        animationTypeForReplace: 'push',
      }}
      initialRouteName="home">
      <Stack.Screen name={'home'} component={Home} />
      <Stack.Screen
        name={'invoice_top_tabs'}
        component={InvoiceTopTabNav}
        options={{
          headerShown: true,
          title: 'Invoices',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
