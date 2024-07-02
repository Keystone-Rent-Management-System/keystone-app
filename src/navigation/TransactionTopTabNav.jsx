import React from 'react';
import COLORS from '../constants/Theme';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {MoneyIn, MoneyOut} from '@/screens';

const TopTab = createMaterialTopTabNavigator();

const TransactionTopTabNav = () => {
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
        name={'money_in'}
        component={MoneyIn}
        options={{
          title: 'Money In',
        }}
      />
      <TopTab.Screen
        name={'money_out'}
        component={MoneyOut}
        options={{
          title: 'Money Out',
        }}
      />
    </TopTab.Navigator>
  );
};

export default TransactionTopTabNav;
