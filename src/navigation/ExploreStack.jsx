import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {ApartmentView, Explore} from '@/screens';

const Stack = createStackNavigator();
const ExploreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="explore">
      <Stack.Screen name={'explore'} component={Explore} />
      <Stack.Screen
        options={{
          animationEnabled: true,
          animationTypeForReplace: 'pop',
          animation: 'slide_from_right',
        }}
        name={'apartment_view'}
        component={ApartmentView}
      />
    </Stack.Navigator>
  );
};

export default ExploreStack;
