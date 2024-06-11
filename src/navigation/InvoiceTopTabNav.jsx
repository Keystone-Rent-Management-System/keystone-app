import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {
  InvoicePaid,
  InvoicePartiallyPaid,
  InvoiceUnpaid,
  InvoiceOverpaid,
} from '@/screens';
import COLORS from '../constants/Theme';

const TopTab = createMaterialTopTabNavigator();
const InvoiceTopTabNav = () => {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Regular',
          textTransform: 'capitalize',
        },
        tabBarIndicatorContainerStyle: {
          width: 'auto',
          padding: '0',
        },
        tabBarItemStyle: {
          height: 'auto',
        },
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.primary,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarPressColor: 'none',
      }}>
      <TopTab.Screen
        name={'invoice_unpaid'}
        component={InvoiceUnpaid}
        options={{
          title: 'Unpaid',
        }}
      />
      <TopTab.Screen
        name={'invoice_partially_paid'}
        component={InvoicePartiallyPaid}
        options={{
          title: 'Partially Paid',
        }}
      />
      <TopTab.Screen
        name={'invoice_paid'}
        component={InvoicePaid}
        options={{
          title: 'Paid',
        }}
      />
      <TopTab.Screen
        name={'invoice_over_paid'}
        component={InvoiceOverpaid}
        options={{
          title: 'Over Paid',
        }}
      />
    </TopTab.Navigator>
  );
};

export default InvoiceTopTabNav;
