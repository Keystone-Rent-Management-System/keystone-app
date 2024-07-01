import React from 'react';
import COLORS from '../constants/Theme';
import {createStackNavigator} from '@react-navigation/stack';
import {PropertyStatements, UnitStatements} from '@/screens';

const Stack = createStackNavigator();

const StatementStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="property_statments">
      <Stack.Screen
        name={'property_statments'}
        component={PropertyStatements}
        options={{
          headerShown: true,
          title: 'Statments',
          headerTitleStyle: {
            color: COLORS.primary,
            fontSize: 18,
            fontFamily: 'Inter-SemiBold',
            marginHorizontal: 'auto',
          },
        }}
      />
      <Stack.Screen
        name={'unit_statements'}
        component={UnitStatements}
        options={({route}) => ({
          headerShown: true,
          title: `${route.params.unitName} statements`,
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

export default StatementStack;
