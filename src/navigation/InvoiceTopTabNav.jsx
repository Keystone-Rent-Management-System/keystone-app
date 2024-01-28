import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import {InvoicePaid, InvoicePendingApproval, InvoiceUnpaid} from '@/screens';
import COLORS from '../constants/Theme';

const InvoiceTopTabNav = () => {
  const TopTab = createMaterialTopTabNavigator();
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
        name={'invoice_pending'}
        component={InvoicePendingApproval}
        options={{
          title: 'Pending Approval',
        }}
      />
      <TopTab.Screen
        name={'invoice_paid'}
        component={InvoicePaid}
        options={{
          title: 'Paid',
        }}
      />
    </TopTab.Navigator>
  );
};

export default InvoiceTopTabNav;
