import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ToastAndroid, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Nav from '@/constants/nav';
import {BottomTabBtn} from '@/components';
import {BottomNavScreens, LandlordBottomNavScreens} from '@/constants';
import useGlobals from '../provider/store/useGlobals';
import {useAuth, useRefreshToken} from '../hooks';

const Tab = createBottomTabNavigator();

const renderTab = ({focused, scr}) => (
  <BottomTabBtn icon={scr.tab.icon} text={scr.tab.title} isCurrent={focused} />
);

// Role-aware bottom nav.
//   - Unauthenticated → tenant tab set (Explore is auth-optional).
//   - ROLE_LANDLORD → landlord command-center tabs (Dashboard /
//     Payments / Leases / Reports / More).
//   - ROLE_TENANT → original tenant tabs (Explore / Home /
//     Notifications / More).
//
// Read profile once at the nav layer so the bottom bar is consistent
// across screen transitions; the per-screen guards in the stacks
// continue to do their own auth checks.
const BottomNav = () => {
  const {auth} = useGlobals(state => state.state);
  const navigation = useNavigation();
  const {profile} = useAuth();

  useRefreshToken();

  const isLandlord = !!profile?.access_types?.roles?.includes('ROLE_LANDLORD');
  const screens = isLandlord ? LandlordBottomNavScreens : BottomNavScreens;

  return (
    <Tab.Navigator screenOptions={Nav.BottomNavOptions}>
      {screens.map((scr, ind) => (
        <Tab.Screen
          key={`${isLandlord ? 'L' : 'T'}-${ind}`}
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
