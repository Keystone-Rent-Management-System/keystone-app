import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {UnitView} from '@/screens';
import COLORS from '@/constants/Theme';
import MyUnitsTopTabNav from './MyUnitsTopTabNav';

const Stack = createStackNavigator();
const MyUnitsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="my_units__top_nav">
      <Stack.Screen
        name={'my_units__top_nav'}
        component={MyUnitsTopTabNav}
        options={{
          headerShown: true,
          title: 'My Unit',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
      <Stack.Screen
        name={'my_units__view'}
        component={UnitView}
        options={{
          headerShown: true,
          title: 'Unit',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default MyUnitsStack;
