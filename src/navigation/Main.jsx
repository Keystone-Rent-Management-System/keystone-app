import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';
import {InvoiceMakePayment, SavedUnits} from '../screens';
import NavOptions from './options';

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
        options={NavOptions.withBackBarOptions}
      />
    </Stack.Navigator>
  );
};

export default MainNav;
