import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import COLORS from '@/constants/Theme';
import {CurrentAgreements, PreviousAgreements} from '@/screens';

const TopTab = createMaterialTopTabNavigator();
const AgreementsTopTabNav = () => {
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
        name={'agreements_current'}
        component={CurrentAgreements}
        options={{
          title: 'Current',
        }}
      />
      <TopTab.Screen
        name={'agreements_previous'}
        component={PreviousAgreements}
        options={{
          title: 'Previous',
        }}
      />
    </TopTab.Navigator>
  );
};

export default AgreementsTopTabNav;
