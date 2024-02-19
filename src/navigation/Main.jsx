import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';
import {
  AccountChangePassword,
  InvoiceMakePayment,
  SavedUnits,
} from '../screens';
import NavOptions from './options';
import COLORS from '../constants/Theme';
import MyUnitsStack from './MyUnitsStack';

const Stack = createStackNavigator();
const MainNav = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="bottom-nav">
      <Stack.Screen name={'bottom-nav'} component={BottomNav} />
      <Stack.Screen name={'apartment_view'} component={ApartmentView} />
      <Stack.Screen name={'apartment-search'} component={ApartmentSearch} />
      <Stack.Screen name={'invoice_view'} component={InvoiceView} />
      <Stack.Screen
        name={'invoice_make_payment'}
        component={InvoiceMakePayment}
        options={NavOptions.withBackBarOptions}
      />
      <Stack.Screen
        name={'more__saved_units'}
        component={SavedUnits}
        options={{
          ...NavOptions.withBackBarOptions,
          title: 'Saved Units',

          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 17,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
      <Stack.Screen
        name={'more__account_password'}
        component={AccountChangePassword}
        options={{
          ...NavOptions.withBackBarOptions,
          title: 'Change Password',

          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 17,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
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

export default MainNav;
