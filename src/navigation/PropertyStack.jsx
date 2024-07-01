import React from 'react';
import COLORS from '../constants/Theme';
import {createStackNavigator} from '@react-navigation/stack';
import {Property, PropertyView} from '@/screens';

const Stack = createStackNavigator();

const PropertyStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="my_properties">
      <Stack.Screen
        name={'my_properties'}
        component={Property}
        options={{
          headerShown: true,
          title: 'My Properties',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
      <Stack.Screen
        name={'my_properties__view'}
        component={PropertyView}
        options={({route}) => ({
          headerShown: true,
          title: route.params.propertyName,
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        })}
      />
    </Stack.Navigator>
  );
};

export default PropertyStack;
