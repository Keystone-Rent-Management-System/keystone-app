import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Explore} from '@/screens';

const Stack = createStackNavigator();
const ExploreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="explore">
      <Stack.Screen name={'explore'} component={Explore} />
    </Stack.Navigator>
  );
};

export default ExploreStack;
