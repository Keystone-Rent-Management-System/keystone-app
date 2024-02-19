import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Bills, Home, InvoiceReceipt, Statements} from '@/screens';
import InvoiceTopTabNav from './InvoiceTopTabNav';
import COLORS from '../constants/Theme';
import {View} from 'react-native';
import MyUnitsStack from './MyUnitsStack';

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
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: renderEmpty,
          title: 'Receipt',
          headerTitleContainerStyle: {
            alignItems: 'center',
            width: '100%',
          },
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
            marginLeft: 30,
          },
        }}
        name={'invoice_receipt'}
        component={InvoiceReceipt}
      />
      <Stack.Screen
        name={'statements'}
        component={Statements}
        options={{
          headerShown: true,
          title: 'Statements',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
          },
        }}
      />
      <Stack.Screen
        name={'bills'}
        component={Bills}
        options={{
          headerShown: true,
          title: 'My Bills',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
          },
        }}
      />

      <Stack.Screen
        name={'my_units'}
        component={MyUnitsStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;

export const renderEmpty = () => <View />;
