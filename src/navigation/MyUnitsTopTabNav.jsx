import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import COLORS from '../constants/Theme';
import {CurrentUnit, PreviousUnits} from '../screens';

const TopTab = createMaterialTopTabNavigator();

const MyUnitsTopTabNav = () => {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
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
        name={'my_units__current'}
        component={CurrentUnit}
        options={{
          title: 'Current',
        }}
      />
      <TopTab.Screen
        name={'my_units__previous'}
        component={PreviousUnits}
        options={{
          title: 'Previous',
        }}
      />
    </TopTab.Navigator>
  );
};

export default MyUnitsTopTabNav;
