import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import BottomNav from './BottomNav';
import {ApartmentSearch, ApartmentView, InvoiceView} from '@/screens';

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
    </Stack.Navigator>
  );
};

export default MainNav;
