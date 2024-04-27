import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ToastAndroid, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Nav from '@/constants/nav';
import {BottomTabBtn} from '@/components';
import {BottomNavScreens} from '@/constants';
import useGlobals from '../provider/store/useGlobals';

const Tab = createBottomTabNavigator();

const renderTab = ({focused, scr}) => (
  <BottomTabBtn icon={scr.tab.icon} text={scr.tab.title} isCurrent={focused} />
);

const BottomNav = () => {
  const {auth} = useGlobals(state => state.state);
  const navigation = useNavigation();

  return (
    <Tab.Navigator screenOptions={Nav.BottomNavOptions}>
      {BottomNavScreens.map((scr, ind) => (
        <Tab.Screen
          key={ind}
          name={scr.title}
          component={scr?.component}
          options={{
            tabBarIcon: ({focused}) => renderTab({focused, scr}),
            ...scr.options,
            tabBarButton: props =>
              renderTabButton({props}, auth, navigation, scr?.title),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNav;

const renderTabButton = ({props}, auth, navigation, title) => (
  <TouchableOpacity
    {...props}
    onPress={() => {
      if (!auth?.access_token && !title?.toLowerCase().includes('explore')) {
        navigation.navigate('auth__login');
        ToastAndroid.show('Please login to access screen', 4000);
      } else {
        props.onPress();
      }
    }}
  />
);
